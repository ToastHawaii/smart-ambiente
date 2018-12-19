export type Image = HTMLCanvasElement & {
  ctx?: CanvasRenderingContext2D | null;
};

export interface Frame {
  delay?: number;
  time?: number;
  disposalMethod?: number;
  image?: Image;
  localColourTableFlag?: boolean;
  localColourTable?: number[][];
  leftPos?: number;
  topPos?: number;
  width?: number;
  height?: number;
  transparencyIndex?: number;
  interlaced?: boolean;
}

export class Stream {
  public data: Uint8ClampedArray;
  public pos: number;
  public len: number;

  constructor(data: number) {
    this.data = new Uint8ClampedArray(data);
    this.pos = 0;
    this.len = this.data.length;
  }
  public getString(count: number) {
    // returns a string from current pos of len count
    let s = "";
    while (count--) {
      s += String.fromCharCode(this.data[this.pos++]);
    }
    return s;
  }
  public readSubBlocks() {
    // reads a set of blocks as a string
    let size;
    let count;
    let data = "";
    do {
      count = size = this.data[this.pos++];
      while (count--) {
        data += String.fromCharCode(this.data[this.pos++]);
      }
    } while (size !== 0 && this.pos < this.len);
    return data;
  }
  public readSubBlocksB() {
    // reads a set of blocks as binary
    let size;
    let count;
    let data = [];
    do {
      count = size = this.data[this.pos++];
      while (count--) {
        data.push(this.data[this.pos++]);
      }
    } while (size !== 0 && this.pos < this.len);
    return data;
  }
}

/** 
  Gif Decoder and player for use with Canvas API's

Gifs use various methods to reduce the file size.
 The loaded frames do not maintain the optimisations and hold the full resolution frames as DOM images. 
 This mean the memory footprint of a decode gif will be many time larger than the Gif file.
 */
export default class GIF {
  private timerID: any; // timer handle for set time out usage
  private st: Stream | undefined; // holds the stream object when loading.
  private interlaceOffsets = [0, 4, 2, 1]; // used in de-interlacing.
  private interlaceSteps = [8, 8, 4, 2];
  private interlacedBufSize: number; // this holds a buffer to de interlace.
  // Created on the first frame and when size changed
  private deinterlaceBuf?: Uint8Array;
  private pixelBufSize?: number; // this holds a buffer for pixels. Created on the first frame and when size changed
  private pixelBuf?: Uint8Array;
  private complete: boolean;
  private GIF_FILE = {
    // gif file data headers
    GCExt: 0xf9,
    COMMENT: 0xfe,
    APPExt: 0xff,
    UNKNOWN: 0x01, // not sure what this is but need to skip it in parser
    IMAGE: 0x2c,
    EOF: 59, // This is entered as decimal
    EXT: 0x21
  };
  // simple buffered stream used to read from the file

  // LZW decoder uncompressed each frames pixels
  // this needs to be optimised.
  // minSize is the min dictionary as powers of two
  // size and data is the compressed pixels
  private lzwDecode(minSize: number, data: number[]) {
    let i;
    let pixelPos;
    let pos;
    let clear;
    let eod;
    let size;
    let done;
    let dic: (number[] | null)[];
    let code;
    let last;
    let d;
    let len;
    pos = pixelPos = 0;
    dic = [];
    clear = 1 << minSize;
    eod = clear + 1;
    size = minSize + 1;
    done = false;
    while (!done) {
      // JavaScript optimisers like a clear exit though I never use 'done' apart from fooling the optimiser
      last = code;

      code = 0;
      for (i = 0; i < size; i++) {
        if (data[pos >> 3] & (1 << (pos & 7))) {
          code |= 1 << i;
        }
        pos++;
      }
      if (code === clear) {
        // clear and reset the dictionary
        dic = [];
        size = minSize + 1;
        for (i = 0; i < clear; i++) {
          dic[i] = [i];
        }
        dic[clear] = [];
        dic[eod] = null;
      } else {
        if (code === eod) {
          done = true;
          return;
        }
        if (code >= dic.length) {
          if (isNullOrUndefined(last)) throw "Value is possibly 'undefined'";
          const dicLast = dic[last];
          if (isNullOrUndefined(dicLast)) throw "Value is possibly 'undefined'";
          dic.push(dicLast.concat(dicLast[0]));
        } else if (last !== clear) {
          if (isNullOrUndefined(last)) throw "Value is possibly 'undefined'";
          const dicLast = dic[last];
          const dicCode = dic[code];
          if (isNullOrUndefined(dicLast) || isNullOrUndefined(dicCode))
            throw "Value is possibly 'undefined'";
          dic.push(dicLast.concat(dicCode[0]));
        }
        d = dic[code];
        if (!d) throw "Value is possibly 'undefined'";
        len = d.length;
        for (i = 0; i < len; i++) {
          if (!this.pixelBuf) throw "Value is possibly 'undefined'";
          this.pixelBuf[pixelPos++] = d[i];
        }
        if (dic.length === 1 << size && size < 12) {
          size++;
        }
      }
    }
  }
  private parseColourTable(count: number) {
    // get a colour table of length count  Each entry is 3 bytes, for RGB.
    let colours = [];
    for (let i = 0; i < count; i++) {
      if (!this.st) throw "Value is possibly 'undefined'";
      colours.push([
        this.st.data[this.st.pos++],
        this.st.data[this.st.pos++],
        this.st.data[this.st.pos++]
      ]);
    }
    return colours;
  }
  public colorRes: number;
  private globalColourCount: number;
  public bgColourIndex: number;
  private globalColourTable?: number[][];
  private bitField: number;
  private parse() {
    // read the header. This is the starting point of the decode and async calls parseBlock
    if (!this.st) throw "Value is possibly 'undefined'";
    this.st.pos += 6;
    this.width =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    this.height =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    this.bitField = this.st.data[this.st.pos++];
    this.colorRes = (this.bitField & 0b1110000) >> 4;
    this.globalColourCount = 1 << ((this.bitField & 0b111) + 1);
    this.bgColourIndex = this.st.data[this.st.pos++];
    // ignoring pixel aspect ratio. if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    this.st.pos++;
    if (this.bitField & 0b10000000) {
      this.globalColourTable = this.parseColourTable(this.globalColourCount);
    } // global colour flag
    setTimeout(() => {
      this.parseBlock();
    }, 0);
  }
  private parseAppExt() {
    // get application specific data. Netscape added iterations and terminator. Ignoring that
    if (!this.st) throw "Value is possibly 'undefined'";
    this.st.pos += 1;
    if ("NETSCAPE" === this.st.getString(8)) {
      // ignoring this data. iterations (word) and terminator (byte)
      this.st.pos += 8;
    } else {
      this.st.pos += 3; // 3 bytes of string usually "2.0" when identifier is NETSCAPE
      this.st.readSubBlocks(); // unknown app extension
    }
  }
  private parseGCExt() {
    // get GC data
    let bitField;
    if (!this.st) throw "Value is possibly 'undefined'";
    this.st.pos++;
    bitField = this.st.data[this.st.pos++];
    this.disposalMethod = (bitField & 0b11100) >> 2;
    this.transparencyGiven = bitField & 0b1 ? true : false; // ignoring bit two that is marked as  userInput???
    this.delayTime =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    this.transparencyIndex = this.st.data[this.st.pos++];
    this.st.pos++;
  }
  private parseImg() {
    // decodes image data to create the indexed pixel image
    const deinterlace = (width: number) => {
      // de interlace pixel data if needed
      if (!this.pixelBufSize) throw "Value is possibly 'undefined'";
      let lines;
      let fromLine;
      let pass;
      let toLine;
      lines = this.pixelBufSize / width;
      fromLine = 0;
      if (this.interlacedBufSize !== this.pixelBufSize) {
        // create the buffer if size changed or undefined.
        this.deinterlaceBuf = new Uint8Array(this.pixelBufSize);
        this.interlacedBufSize = this.pixelBufSize;
      }
      for (pass = 0; pass < 4; pass++) {
        for (
          toLine = this.interlaceOffsets[pass];
          toLine < lines;
          toLine += this.interlaceSteps[pass]
        ) {
          if (!this.deinterlaceBuf || !this.pixelBuf)
            throw "Value is possibly 'undefined'";
          this.deinterlaceBuf.set(
            this.pixelBuf.subarray(fromLine, fromLine + width),
            toLine * width
          );
          fromLine += width;
        }
      }
    };
    const frame: Frame = {};
    this.frames.push(frame);
    frame.disposalMethod = this.disposalMethod;
    frame.time = this.length;
    if (!this.delayTime) throw "Value is possibly 'undefined'";
    frame.delay = this.delayTime * 10;
    this.length += frame.delay;
    if (this.transparencyGiven) {
      frame.transparencyIndex = this.transparencyIndex;
    } else {
      frame.transparencyIndex = undefined;
    }
    if (!this.st) throw "Value is possibly 'undefined'";
    frame.leftPos =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    frame.topPos =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    frame.width =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    frame.height =
      this.st.data[this.st.pos++] + (this.st.data[this.st.pos++] << 8);
    this.bitField = this.st.data[this.st.pos++];
    frame.localColourTableFlag = this.bitField & 0b10000000 ? true : false;
    if (frame.localColourTableFlag) {
      frame.localColourTable = this.parseColourTable(
        1 << ((this.bitField & 0b111) + 1)
      );
    }
    if (this.pixelBufSize !== frame.width * frame.height) {
      // create a pixel buffer if not yet created or if current frame size is different from previous
      this.pixelBuf = new Uint8Array(frame.width * frame.height);
      this.pixelBufSize = frame.width * frame.height;
    }
    this.lzwDecode(this.st.data[this.st.pos++], this.st.readSubBlocksB()); // decode the pixels
    if (this.bitField & 0b1000000) {
      // de interlace if needed
      frame.interlaced = true;
      deinterlace(frame.width);
    } else {
      frame.interlaced = false;
    }
    this.processFrame(frame); // convert to canvas image
  }
  private processFrame(frame: Frame) {
    // creates a RGBA canvas image from the indexed pixel data.
    let ct;
    let cData;
    let dat;
    let pixCount;
    let ind;
    let useT;
    let i;
    let pixel;
    let pDat: Uint8Array | undefined;
    let col;
    let ti;
    frame.image = document.createElement("canvas");
    if (isNullOrUndefined(this.width) || isNullOrUndefined(this.height))
      throw "Value is possibly 'undefined'";
    frame.image.width = this.width;
    frame.image.height = this.height;
    frame.image.ctx = frame.image.getContext("2d");
    ct = frame.localColourTableFlag
      ? frame.localColourTable
      : this.globalColourTable;
    if (this.lastFrame === null) {
      this.lastFrame = frame;
    }
    useT =
      this.lastFrame.disposalMethod === 2 || this.lastFrame.disposalMethod === 3
        ? true
        : false;
    if (!useT) {
      if (
        isNullOrUndefined(frame.image.ctx) ||
        isNullOrUndefined(this.lastFrame.image) ||
        isNullOrUndefined(this.width) ||
        isNullOrUndefined(this.height)
      )
        throw "Value is possibly 'undefined'";
      frame.image.ctx.drawImage(
        this.lastFrame.image,
        0,
        0,
        this.width,
        this.height
      );
    }
    if (
      isNullOrUndefined(frame.image.ctx) ||
      isNullOrUndefined(frame.leftPos) ||
      isNullOrUndefined(frame.topPos) ||
      isNullOrUndefined(frame.width) ||
      isNullOrUndefined(frame.height)
    )
      throw "Value is possibly 'undefined'";
    cData = frame.image.ctx.getImageData(
      frame.leftPos,
      frame.topPos,
      frame.width,
      frame.height
    );
    ti = frame.transparencyIndex;
    dat = cData.data;
    if (frame.interlaced) {
      pDat = this.deinterlaceBuf;
    } else {
      pDat = this.pixelBuf;
    }
    if (!pDat) throw "Value is possibly 'undefined'";
    pixCount = pDat.length;
    ind = 0;
    for (i = 0; i < pixCount; i++) {
      pixel = pDat[i];
      if (!ct) throw "Value is possibly 'undefined'";
      col = ct[pixel];
      if (ti !== pixel) {
        dat[ind++] = col[0];
        dat[ind++] = col[1];
        dat[ind++] = col[2];
        dat[ind++] = 255; // Opaque.
      } else if (useT) {
        dat[ind + 3] = 0; // Transparent.
        ind += 4;
      } else {
        ind += 4;
      }
    }
    frame.image.ctx.putImageData(cData, frame.leftPos, frame.topPos);
    this.lastFrame = frame;
    if (!this.waitTillDone && typeof this.onload === "function") {
      this.doOnloadEvent();
    } // if !waitTillDone the call onload now after first frame is loaded
  }
  private finnished() {
    // called when the load has completed
    this.loading = false;
    this.frameCount = this.frames.length;
    this.lastFrame = null;
    this.st = undefined;
    this.complete = true;
    this.disposalMethod = undefined;
    this.transparencyGiven = undefined;
    this.delayTime = undefined;
    this.transparencyIndex = undefined;
    this.waitTillDone = undefined;
    this.pixelBuf = undefined; // dereference pixel buffer
    this.deinterlaceBuf = undefined; // dereference interlace buff (may or may not be used);
    this.pixelBufSize = undefined;
    this.currentFrame = 0;
    if (this.frames.length > 0) {
      this.image = this.frames[0].image;
    }
    this.doOnloadEvent();
    if (typeof this.onloadall === "function") {
      this.onloadall.bind(this)({ type: "loadall", path: [this] });
    }
    if (this.playOnLoad) {
      this.play();
    }
  }
  private canceled() {
    // called if the load has been cancelled
    this.finnished();
    if (typeof this.cancelCallback === "function") {
      this.cancelCallback.bind(this)({ type: "canceled", path: [this] });
    }
  }
  private parseExt() {
    // parse extended blocks

    if (!this.st) throw "Value is possibly 'undefined'";
    const blockID = this.st.data[this.st.pos++];
    if (blockID === this.GIF_FILE.GCExt) {
      this.parseGCExt();
    } else if (blockID === this.GIF_FILE.COMMENT) {
      this.comment += this.st.readSubBlocks();
    } else if (blockID === this.GIF_FILE.APPExt) {
      this.parseAppExt();
    } else {
      if (blockID === this.GIF_FILE.UNKNOWN) {
        this.st.pos += 13;
      } // skip unknow block
      this.st.readSubBlocks();
    }
  }
  private parseBlock() {
    // parsing the blocks
    if (this.isCanceled !== undefined && this.isCanceled === true) {
      this.canceled();
      return;
    }

    if (!this.st) throw "Value is possibly 'undefined'";
    const blockId = this.st.data[this.st.pos++];
    if (blockId === this.GIF_FILE.IMAGE) {
      // image block
      this.parseImg();
      if (this.firstFrameOnly) {
        this.finnished();
        return;
      }
    } else if (blockId === this.GIF_FILE.EOF) {
      this.finnished();
      return;
    } else {
      this.parseExt();
    }
    if (typeof this.onprogress === "function") {
      this.onprogress({
        bytesRead: this.st.pos,
        totalBytes: this.st.data.length,
        frame: this.frames.length
      });
    }
    setTimeout(() => {
      this.parseBlock();
    }, 0); // parsing frame async so processes can get some time in.
  }
  private isCanceled: boolean | undefined;
  private cancelCallback: any;
  /**
   * call to stop loading
   * @param callback
   */
  public cancel(callback: any) {
    // cancels the loading. This will cancel the load before the next frame is decoded
    if (this.complete) {
      return false;
    }
    this.cancelCallback = callback;
    this.isCanceled = true;
    return true;
  }
  private error(type: any) {
    if (typeof this.onerror === "function") {
      this.onerror.bind(this)({ type: type, path: [this] });
    }
    this.onload = this.onerror = undefined;
    this.loading = false;
  }
  public nextFrameAt: number;
  public lastFrameAt: number;
  private doOnloadEvent() {
    // fire onload event if set
    this.currentFrame = 0;
    this.nextFrameAt = this.lastFrameAt = new Date().valueOf(); // just sets the time now
    if (typeof this.onload === "function") {
      this.onload.bind(this)({ type: "load", path: [this] });
    }
    this.onerror = this.onload = undefined;
  }
  private dataLoaded(data: number) {
    // Data loaded create stream and parse
    this.st = new Stream(data);
    this.parse();
  }
  public src: string;
  /**
   * call this to load a file
   * @param filename
   */
  public load(filename: string) {
    return new Promise<void>(resolve => {
      // starts the load
      let ajax = new XMLHttpRequest();
      ajax.responseType = "arraybuffer";
      ajax.onload = (e: any) => {
        if (e.target.status === 404) {
          this.error("File not found");
        } else if (e.target.status >= 200 && e.target.status < 300) {
          this.dataLoaded(ajax.response);
        } else {
          this.error("Loading error : " + e.target.status);
        }
        resolve();
      };
      ajax.open("GET", filename, true);
      ajax.send();
      ajax.onerror = _e => {
        this.error("File error");
      };
      this.src = filename;
      this.loading = true;
    });
  }

  /**
   * call to start play
   */
  public play() {
    // starts play if paused
    if (!this.playing) {
      this.paused = false;
      this.playing = true;
      this.startPlaying();
    }
  }
  /**
   * call to pause
   */
  public pause() {
    // stops play
    this.paused = true;
    this.playing = false;
    clearTimeout(this.timerID);
  }
  /**
   * call to toggle play and pause state
   */
  public togglePlay() {
    if (this.paused || !this.playing) {
      this.play();
    } else {
      this.pause();
    }
  }
  /**
   * call to seek to frame
   */
  public seekFrame(frame: number) {
    // seeks to frame number.
    clearTimeout(this.timerID);
    this.currentFrame = frame % this.frames.length;
    if (this.playing) {
      this.startPlaying();
    } else {
      this.image = this.frames[this.currentFrame].image;
    }
  }
  /**
   * call to seek to time
   */
  public seek(time: number) {
    // time in Seconds  // seek to frame that would be displayed at time
    clearTimeout(this.timerID);
    if (time < 0) {
      time = 0;
    }
    time *= 1000; // in ms
    time %= this.length;
    let frame = 0;
    let currentTime = this.frames[frame].time;
    let currentDelay = this.frames[frame].delay;

    if (!currentTime || !currentDelay) throw "Value is possibly 'undefined'";
    while (time > currentTime + currentDelay && frame < this.frames.length) {
      frame += 1;
      let currentTime = this.frames[frame].time;
      let currentDelay = this.frames[frame].delay;

      if (!currentTime || !currentDelay) throw "Value is possibly 'undefined'";
    }
    this.currentFrame = frame;
    if (this.playing) {
      this.startPlaying();
    } else {
      this.image = this.frames[this.currentFrame].image;
    }
  }
  private startPlaying() {
    let delay;
    let frame;
    if (this.playSpeed === 0) {
      this.pause();
      return;
    } else {
      if (this.playSpeed < 0) {
        this.currentFrame -= 1;
        if (this.currentFrame < 0) {
          this.currentFrame = this.frames.length - 1;
        }
        frame = this.currentFrame;
        frame -= 1;
        if (frame < 0) {
          frame = this.frames.length - 1;
        }
        const currentDelay = this.frames[frame].delay;
        if (!currentDelay) throw "Value is possibly 'undefined'";
        delay = (-currentDelay * 1) / this.playSpeed;
      } else {
        this.currentFrame += 1;
        this.currentFrame %= this.frames.length;
        const currentDelay = this.frames[this.currentFrame].delay;
        if (!currentDelay) throw "Value is possibly 'undefined'";
        delay = (currentDelay * 1) / this.playSpeed;
      }
      this.image = this.frames[this.currentFrame].image;
      this.timerID = setTimeout(() => {
        this.startPlaying();
      }, delay);
    }
  }

  /**
   * fire on load. Use waitTillDone = true to have load fire at end or false to fire on first frame
   */
  public onload?: Function | null = null;

  /**
   *  fires on error
   */
  public onerror?: Function | null = null;
  /**
   * fires a load progress event
   */
  public onprogress: Function | null = null;
  public onloadall: Function | null = null; // event fires when all frames have loaded and gif is ready
  public paused = false; // true if paused
  public playing = false; // true if playing
  public waitTillDone? = true; // If true onload will fire when all frames loaded, if false, onload will fire when first frame has loaded
  public loading = false; // true if still loading
  public firstFrameOnly = false; // if true only load the first frame
  public width: number | null = null; // width in pixels
  public height: number | null = null; // height in pixels
  public frames: Frame[] = []; // array of frames
  public comment = ""; // comments if found in file. Note I remember that some gifs have comments per frame if so this will be all comment concatenated
  public length = 0; // gif length in ms (1/1000 second)
  public currentFrame = 0; // current frame.
  public frameCount = 0; // number of frames
  public playSpeed = 1; // play speed 1 normal, 2 twice 0.5 half, -1 reverse etc...
  /**
   * temp hold last frame loaded so you can display the gif as it loads
   */
  public lastFrame: Frame | null = null;
  /**
   * the current image at the currentFrame
   */
  public image?: Image | null = null;
  /**
   * if true starts playback when loaded
   */
  public playOnLoad = true;

  private transparencyIndex?: number;
  private delayTime?: number;
  private transparencyGiven?: boolean;
  private disposalMethod?: number;
}

function isNullOrUndefined<T>(v: T | null | undefined): v is null | undefined {
  return v === undefined || v === null;
}
