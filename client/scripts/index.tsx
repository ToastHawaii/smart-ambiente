import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/App";

ReactDOM.render(<App />, document.getElementById("app"));

// let allButtons = document.querySelectorAll("button");

// let activeElement = allButtons[0];

// if (navigator.userAgent.indexOf("SMART-TV") !== -1) {

//     document.addEventListener('keydown', (event) => {
//         let direction: "left" | "up" | "right" | "down";
//         switch (event.keyCode) {
//             case 37:
//                 direction = "left";
//                 break;
//             case 38:
//                 direction = "up";
//                 break;
//             case 39:
//                 direction = "right";
//                 break;
//             case 40:
//                 direction = "down";
//                 break;

//             default:
//                 return;
//         }

//         changeFocus(direction);
//     });

//     let previousEvent: MouseEvent;

//     document.addEventListener('mousemove', (event) => {
//         let direction: "left" | "up" | "right" | "down";

//         let movementX = event.movementX || (previousEvent && event.screenX - previousEvent.screenX);
//         let movementY = event.movementY || (previousEvent && event.screenY - previousEvent.screenY);

//         previousEvent = event;

//         if (movementX < 0)
//             direction = "left";
//         else if (movementX > 0)
//             direction = "right";
//         else if (movementY > 0)
//             direction = "down";
//         else if (movementY < 0)
//             direction = "up";
//         else
//             return;
//         changeFocus(direction);
//     });

//     document.addEventListener('mousedown', (event: any) => {
//         if (activeElement && isLeftMouseButtonDown(event)) {
//             activeElement.click();
//         }
//     });
// }

// function isLeftMouseButtonDown(evt: any) {
//     evt = evt || window.event;
//     var button = evt.buttons || evt.which || evt.button;
//     return button == 1;
// }

// function changeFocus(direction: "left" | "up" | "right" | "down") {

//     if (!activeElement)
//         return;

//     const tabindex = activeElement.getAttribute("tabindex");

//     if (!tabindex)
//         return;

//     let nextElement: HTMLElement | null = null;

//     switch (direction) {
//         case "left":
//             nextElement = activeElement.previousElementSibling as HTMLElement;
//             break;
//         case "up":
//             nextElement = previous(activeElement) as HTMLElement;
//             break;
//         case "right":
//             nextElement = activeElement.nextElementSibling as HTMLElement;
//             break;
//         case "down":
//             nextElement = next(activeElement) as HTMLElement;
//             break;

//         default:
//             throw "Direction not known.";
//     }

//     if (nextElement) {
//         activeElement.classList.remove('focus');
//         nextElement.classList.add('focus');
//         activeElement = nextElement as HTMLButtonElement;
//     }
// }

// function previous(element: Element | null): Element | null {
//     if (!element)
//         return null;

//     if (element.previousElementSibling) {
//         const previousElement = element.previousElementSibling.querySelector("button");
//         scrollIntoViewIfNeeded(previousElement);
//         if (previousElement && isVisible(previousElement))
//             return previousElement;

//         if (element.previousElementSibling.previousElementSibling)
//             return previous(element.previousElementSibling);
//     }

//     return previous(element.parentElement);
// }

// function next(element: Element | null): Element | null {
//     if (!element)
//         return null;

//     if (element.nextElementSibling) {
//         const nextElement = element.nextElementSibling.querySelector("button");
//         scrollIntoViewIfNeeded(nextElement);
//         if (nextElement && isVisible(nextElement))
//             return nextElement;

//         if (element.nextElementSibling.nextElementSibling)
//             return next(element.nextElementSibling);
//     }

//     return next(element.parentElement);
// }

// function isVisible(elem: HTMLElement) {
//     const style = getComputedStyle(elem);
//     if (style.display === 'none') return false;
//     if (style.visibility !== 'visible') return false;
//     if (style.opacity && parseFloat(style.opacity) < 0.1) return false;
//     if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
//         elem.getBoundingClientRect().width === 0) {
//         return false;
//     }
//     const elemCenter = {
//         x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
//         y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
//     };
//     if (elemCenter.x < 0) return false;
//     if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
//     if (elemCenter.y < 0) return false;
//     if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
//     let pointContainer: Node | null = document.elementFromPoint(elemCenter.x, elemCenter.y);
//     do {
//         if (pointContainer === elem) return true;
//         if (pointContainer === null) return false;
//     } while (pointContainer = pointContainer.parentNode);
//     return false;
// }

// function scrollIntoViewIfNeeded(target: HTMLElement | null) {

//     if (!target)
//         return;

//     var rect = target.getBoundingClientRect();
//     if (rect.bottom > window.innerHeight) {
//         target.scrollIntoView(false);
//     }
//     if (rect.top < 0) {
//         target.scrollIntoView();
//     }
// }
