// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

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
  let running: boolean = true;
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

export function scale(
  val: number,
  min: number,
  max: number,
  from: number,
  to: number
) {
  return ((to - from) * (val - min)) / (max - min) + from;
}

export function isVisible(elem: HTMLElement): boolean {
  return isDisplay(elem) && isInScreen(elem);
}

function isDisplay(elem: HTMLElement): boolean {
  const style = getComputedStyle(elem);
  if (style.display === "none") return false;
  if (style.visibility !== "visible") return false;
  if (style.opacity && parseFloat(style.opacity) < 0.1) return false;

  if (elem.parentElement && !isDisplay(elem.parentElement)) {
    return false;
  }
  return true;
}

function isInScreen(elem: HTMLElement): boolean {
  const style = getComputedStyle(elem);

  if (style.height === "0px" || style.width === "0px") return false;

  const rect = elem.getBoundingClientRect();
  if (elem.offsetWidth + elem.offsetHeight + rect.height + rect.width === 0) {
    return false;
  }
  const elemCenter = {
    x: rect.left + elem.offsetWidth / 2,
    y: rect.top + elem.offsetHeight / 2
  };
  if (elemCenter.x < 0) return false;
  if (
    elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)
  )
    return false;
  if (elemCenter.y < 0) return false;
  if (
    elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)
  )
    return false;

  if (elem.parentElement) {
    if (style.position === "absolute" || style.position === "fixed")
      return true;

    return isInScreen(elem.parentElement);
  }

  return true;
}

export function scrollIntoViewIfNeeded(target: HTMLElement | null) {
  if (!target) return;

  let rect = target.getBoundingClientRect();
  if (rect.bottom > window.innerHeight) {
    target.scrollIntoView(false);
  }
  if (rect.top < 0) {
    target.scrollIntoView();
  }
}

export function isLeftMouseButtonDown(evt: any) {
  evt = evt || window.event;
  let button = evt.buttons || evt.which || evt.button;
  return button === 1;
}
