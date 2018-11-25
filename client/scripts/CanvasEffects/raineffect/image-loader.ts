declare var Promise: any;
function loadImage(
  src: { name: string; src: string; img?: HTMLImageElement } | string,
  i: number,
  onLoad: Function
) {
  return new Promise((resolve: any) => {
    if (typeof src === "string") {
      src = {
        name: "image" + i,
        src
      };
    }

    let img = new Image();
    src.img = img;
    img.addEventListener("load", _event => {
      if (typeof onLoad === "function") {
        onLoad.call(undefined, img, i);
      }
      resolve(src);
    });
    img.src = src.src;
  });
}

function loadImageThump(src: any, i: number, onLoad: Function) {
  return new Promise((resolve: any) => {
    if (typeof src === "string") {
      src = {
        name: "imageThump" + i,
        src
      };
    } else {
      src.name += "Thump";
    }

    resize(src.src, 200, 200, function(data: string) {
      let img = new Image();
      src.img = img;
      img.addEventListener("load", _event => {
        if (typeof onLoad === "function") {
          onLoad.call(undefined, img, i);
        }
        resolve(src);
      });
      img.src = data;
    });
  });
}

function loadImages(
  images: { thump: string; name: string; src: string }[],
  onLoad: Function
) {
  return Promise.all(
    [].concat.apply(
      [],
      images.map((src, i) => {
        if (src.thump)
          return [
            loadImage(src, i, onLoad),
            loadImageThump({ src: src.src, name: src.name }, i, onLoad)
          ];
        else return [loadImage(src, i, onLoad)];
      })
    )
  );
}

export default async function ImageLoader(images: any, onLoad: any) {
  return new Promise((resolve: any) => {
    loadImages(images, onLoad).then((loadedImages: any) => {
      let r: any = {};
      loadedImages.forEach((curImage: any) => {
        r[curImage.name] = {
          img: curImage.img,
          src: curImage.src,
          width: curImage.img.width,
          height: curImage.img.height
        };
      });

      resolve(r);
    });
  });
}

function resize(
  imageData: string,
  maxWidth: number,
  maxHeight: number,
  callback: Function
) {
  let tempImage = new Image();

  tempImage.onload = function() {
    let tempWidth = tempImage.width;
    let tempHeight = tempImage.height;

    if (tempImage.width !== undefined) {
      if (tempWidth > tempHeight) {
        if (tempWidth > maxWidth) {
          tempHeight *= maxWidth / tempWidth;
          tempWidth = maxWidth;
        }
      } else {
        if (tempHeight > maxHeight) {
          tempWidth *= maxHeight / tempHeight;
          tempHeight = maxHeight;
        }
      }

      let canvas = document.createElement("canvas");
      canvas.width = tempWidth;
      canvas.height = tempHeight;

      let canvasContext = canvas.getContext("2d");
      if (!canvasContext) throw "CanvasContext is undefined";
      canvasContext.drawImage(this as any, 0, 0, tempWidth, tempHeight);

      let dataUrl = canvas.toDataURL("image/jpeg");

      callback(dataUrl);
    }
  };

  tempImage.src = imageData;
}
