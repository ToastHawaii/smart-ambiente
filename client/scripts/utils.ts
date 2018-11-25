export async function postJson(url: string, data: any) {
  const response = await fetch(url, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export async function getJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  });

  return response.json();
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function imageFromSource(src: string) {
  return new Promise<HTMLImageElement>(resolve => {
    const img = new Image();
    img.addEventListener("load", _event => {
      resolve(img);
    });
    img.src = src;
  });
}

export function animate(render: (delta: number) => Promise<boolean>) {
  let running: boolean | undefined = undefined;
  let lastFrame = +new Date();

  function loop(now: number) {
    // stop the loop if render returned false
    if (running !== false) {
      let deltaT = now - lastFrame;
      if (deltaT > 0 && deltaT < 160) {
        render(deltaT).then(result => {
          running = result;
          lastFrame = now;
          requestAnimationFrame(loop);
        });
      } else {
        lastFrame = now;
        requestAnimationFrame(loop);
      }
    }
  }
  loop(lastFrame);
}
