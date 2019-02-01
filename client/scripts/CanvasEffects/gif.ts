export interface Frame {
  delay: number;
  startTime: number;
  endTime: number;
  disposalMethod?: number;
  image: HTMLCanvasElement;
  localColourTableFlag: boolean;
  localColourTable?: number[][];
  leftPos: number;
  topPos: number;
  width: number;
  height: number;
  transparencyIndex?: number;
  interlaced: boolean;
}

/**
 * simple buffered stream used to read from the file
 */
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

interface Buffers {
  /**
   *  used in de-interlacing.
   */
  interlaceOffsets: number[];
  interlaceSteps: number[];
  /**
   * this holds a buffer to de interlace. Created on the first frame and when size changed
   */
  interlacedBufSize?: number;
  deinterlaceBuf?: Uint8Array;
  /**
   * this holds a buffer for pixels. Created on the first frame and when size changed
   */
  pixelBufSize?: number;
  pixelBuf?: Uint8Array;
}

const GIF_FILE = {
  // gif file data headers
  GCExt: 0xf9,
  COMMENT: 0xfe,
  APPExt: 0xff,
  UNKNOWN: 0x01, // not sure what this is but need to skip it in parser
  IMAGE: 0x2c,
  EOF: 59, // This is entered as decimal
  EXT: 0x21
};

export interface Options {
  firstFrameOnly?: boolean;
}

/**
 *  LZW decoder uncompressed each frames pixels this needs to be optimised.
 * @param minSize minSize is the min dictionary as powers of two size
 * @param data data is the compressed pixels
 * @param buffers
 */
function lzwDecode(minSize: number, data: number[], buffers: Buffers) {
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
        if (!buffers.pixelBuf) throw "Value is possibly 'undefined'";
        buffers.pixelBuf[pixelPos++] = d[i];
      }
      if (dic.length === 1 << size && size < 12) {
        size++;
      }
    }
  }
}

function parseColourTable(count: number, st: Stream) {
  // get a colour table of length count  Each entry is 3 bytes, for RGB.
  const colours = [];
  for (let i = 0; i < count; i++) {
    colours.push([st.data[st.pos++], st.data[st.pos++], st.data[st.pos++]]);
  }
  return colours;
}

interface Context {
  disposalMethod?: number;
  transparencyGiven?: boolean;
  delayTime?: number;
  transparencyIndex?: number;
}

function parse(
  url: string,
  options: Options,
  st: Stream,
  resolve: (value: Gif) => void
) {
  st.pos += 6;

  // read the header. This is the starting point of the decode and async calls parseBlock
  const gif: Gif = {
    src: url,
    comment: "",
    frames: [],
    length: 0,

    bgColourIndex: 0,
    globalColourCount: 0,
    colorRes: 0,
    height: 0,
    width: 0
  };

  gif.width = st.data[st.pos++] + (st.data[st.pos++] << 8);
  gif.height = st.data[st.pos++] + (st.data[st.pos++] << 8);
  const bitField = st.data[st.pos++];
  gif.colorRes = (bitField & 0b1110000) >> 4;
  gif.globalColourCount = 1 << ((bitField & 0b111) + 1);
  gif.bgColourIndex = st.data[st.pos++];
  // ignoring pixel aspect ratio. if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
  st.pos++;
  if (bitField & 0b10000000) {
    gif.globalColourTable = parseColourTable(gif.globalColourCount, st);
  } // global colour flag
  setTimeout(() => {
    parseBlock(gif, options, st, resolve);
  }, 0);
}
function parseAppExt(st: Stream) {
  // get application specific data. Netscape added iterations and terminator. Ignoring that
  st.pos += 1;
  if ("NETSCAPE" === st.getString(8)) {
    // ignoring this data. iterations (word) and terminator (byte)
    st.pos += 8;
  } else {
    st.pos += 3; // 3 bytes of string usually "2.0" when identifier is NETSCAPE
    st.readSubBlocks(); // unknown app extension
  }
}

export function parseGif(
  url: string,
  options: Options = { firstFrameOnly: false }
) {
  return new Promise<Gif>((resolve, reject) => {
    // starts the load
    let ajax = new XMLHttpRequest();
    ajax.responseType = "arraybuffer";
    ajax.onload = (e: any) => {
      if (e.target.status === 404) {
        reject("File not found");
      } else if (e.target.status >= 200 && e.target.status < 300) {
        // Data loaded create stream and parse
        parse(url, options, new Stream(ajax.response), resolve);
      } else {
        reject("Loading error: " + e.target.status);
      }
    };
    ajax.open("GET", url, true);
    ajax.send();
    ajax.onerror = _e => {
      reject("File error");
    };
  });
}
function parseGCExt(st: Stream, context: Context) {
  // get GC data
  let bitField;
  st.pos++;

  bitField = st.data[st.pos++];
  context.disposalMethod = (bitField & 0b11100) >> 2;
  context.transparencyGiven = bitField & 0b1 ? true : false; // ignoring bit two that is marked as  userInput???
  context.delayTime = st.data[st.pos++] + (st.data[st.pos++] << 8);
  context.transparencyIndex = st.data[st.pos++];

  st.pos++;
}

function deinterlace(width: number, buffers: Buffers) {
  // de interlace pixel data if needed
  if (isNullOrUndefined(buffers.pixelBufSize))
    throw "Value is possibly 'undefined'";
  let lines;
  let fromLine;
  let pass;
  let toLine;
  lines = buffers.pixelBufSize / width;
  fromLine = 0;
  if (buffers.interlacedBufSize !== buffers.pixelBufSize) {
    // create the buffer if size changed or undefined.
    buffers.deinterlaceBuf = new Uint8Array(buffers.pixelBufSize);
    buffers.interlacedBufSize = buffers.pixelBufSize;
  }
  for (pass = 0; pass < 4; pass++) {
    for (
      toLine = buffers.interlaceOffsets[pass];
      toLine < lines;
      toLine += buffers.interlaceSteps[pass]
    ) {
      if (
        isNullOrUndefined(buffers.deinterlaceBuf) ||
        isNullOrUndefined(buffers.pixelBuf)
      )
        throw "Value is possibly 'undefined'";
      buffers.deinterlaceBuf.set(
        buffers.pixelBuf.subarray(fromLine, fromLine + width),
        toLine * width
      );
      fromLine += width;
    }
  }
}
function parseImg(
  st: Stream,
  gif: Gif,
  context: Context,
  previousFrame?: Frame
) {
  if (isNullOrUndefined(context.delayTime))
    throw "Value is possibly 'undefined'";

  const frame: Frame = {
    disposalMethod: context.disposalMethod,
    startTime: gif.length,
    delay: context.delayTime * 10,
    endTime: gif.length + context.delayTime * 10,
    transparencyIndex: context.transparencyGiven
      ? context.transparencyIndex
      : undefined,
    leftPos: st.data[st.pos++] + (st.data[st.pos++] << 8),
    topPos: st.data[st.pos++] + (st.data[st.pos++] << 8),
    width: st.data[st.pos++] + (st.data[st.pos++] << 8),
    height: st.data[st.pos++] + (st.data[st.pos++] << 8),

    localColourTableFlag: false,
    localColourTable: undefined,

    interlaced: false,

    image: document.createElement("canvas")
  };

  const bitField = st.data[st.pos++];
  if (bitField & 0b10000000) {
    frame.localColourTableFlag = true;
    frame.localColourTable = parseColourTable(
      1 << ((bitField & 0b111) + 1),
      st
    );
  }
  gif.length += frame.delay;
  const buffers: Buffers = {
    interlaceOffsets: [0, 4, 2, 1], // used in de-interlacing.
    interlaceSteps: [8, 8, 4, 2]
  };
  if (buffers.pixelBufSize !== frame.width * frame.height) {
    // create a pixel buffer if not yet created or if current frame size is different from previous
    buffers.pixelBuf = new Uint8Array(frame.width * frame.height);
    buffers.pixelBufSize = frame.width * frame.height;
  }
  lzwDecode(st.data[st.pos++], st.readSubBlocksB(), buffers); // decode the pixels

  if (bitField & 0b1000000) {
    // de interlace if needed
    frame.interlaced = true;
    deinterlace(frame.width, buffers);
  }

  processFrame(frame, gif, buffers, previousFrame); // convert to canvas image

  return frame;
}

function processFrame(
  frame: Frame,
  gif: Gif,
  buffers: Buffers,
  previousFrame?: Frame
) {
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

  if (isNullOrUndefined(gif.width) || isNullOrUndefined(gif.height))
    throw "Value is possibly 'undefined'";
  frame.image.width = gif.width;
  frame.image.height = gif.height;
  const ctx = frame.image.getContext("2d");
  ct = frame.localColourTableFlag
    ? frame.localColourTable
    : gif.globalColourTable;
  if (previousFrame === undefined) {
    previousFrame = frame;
  }
  useT =
    previousFrame.disposalMethod === 2 || previousFrame.disposalMethod === 3
      ? true
      : false;
  if (!useT) {
    if (
      isNullOrUndefined(ctx) ||
      isNullOrUndefined(previousFrame.image) ||
      isNullOrUndefined(gif.width) ||
      isNullOrUndefined(gif.height)
    )
      throw "Value is possibly 'undefined'";
    ctx.drawImage(previousFrame.image, 0, 0, gif.width, gif.height);
  }
  if (
    isNullOrUndefined(ctx) ||
    isNullOrUndefined(frame.leftPos) ||
    isNullOrUndefined(frame.topPos) ||
    isNullOrUndefined(frame.width) ||
    isNullOrUndefined(frame.height)
  )
    throw "Value is possibly 'undefined'";
  cData = ctx.getImageData(
    frame.leftPos,
    frame.topPos,
    frame.width,
    frame.height
  );
  ti = frame.transparencyIndex;
  dat = cData.data;
  if (frame.interlaced) {
    pDat = buffers.deinterlaceBuf;
  } else {
    pDat = buffers.pixelBuf;
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
  ctx.putImageData(cData, frame.leftPos, frame.topPos);

  return frame;
}

function parseExt(st: Stream, gif: Gif, context: Context) {
  // parse extended blocks

  const blockID = st.data[st.pos++];
  if (blockID === GIF_FILE.GCExt) {
    parseGCExt(st, context);
  } else if (blockID === GIF_FILE.COMMENT) {
    gif.comment += st.readSubBlocks();
  } else if (blockID === GIF_FILE.APPExt) {
    parseAppExt(st);
  } else {
    if (blockID === GIF_FILE.UNKNOWN) {
      st.pos += 13;
    } // skip unknow block
    st.readSubBlocks();
  }
}
function parseBlock(
  gif: Gif,
  options: Options,
  st: Stream,
  resolve: (value: Gif) => void,
  context: Context = {},
  previousFrame?: Frame
) {
  // parsing the blocks

  const blockId = st.data[st.pos++];
  if (blockId === GIF_FILE.IMAGE) {
    // image block
    previousFrame = parseImg(st, gif, context, previousFrame);
    gif.frames.push(previousFrame);
    if (options.firstFrameOnly) {
      resolve(gif);
      return;
    }
  } else if (blockId === GIF_FILE.EOF) {
    resolve(gif);
    return;
  } else {
    parseExt(st, gif, context);
  }

  setTimeout(() => {
    parseBlock(gif, options, st, resolve, context, previousFrame);
  }, 0); // parsing frame async so processes can get some time in.
}

/**
 * call to seek to time
 * @param gif
 * @param time time in ms
 */
export function seek(gif: Gif, time: number) {
  // seek to frame that would be displayed at time
  if (time < 0) {
    time = 0;
  }
  time %= gif.length;
  let frame = 0;

  while (time > gif.frames[frame].endTime && frame < gif.frames.length) {
    frame += 1;
  }

  return frame;
}

export interface Gif {
  globalColourTable?: number[][];
  bgColourIndex: number;
  globalColourCount: number;
  colorRes: number;
  src: string;
  /**
   *  width in pixels
   */
  width: number;
  /**
   * height in pixels
   */
  height: number;
  frames: Frame[];
  /**
   *  comments if found in file. Note I remember that some gifs have comments per frame if so this will be all comment concatenated
   */
  comment: string;
  /**
   *  gif length in ms (1/1000 second)
   */
  length: number;
}

function isNullOrUndefined<T>(v: T | null | undefined): v is null | undefined {
  return v === undefined || v === null;
}
