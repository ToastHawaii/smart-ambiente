import * as React from "react";
import {
  StyleRulesCallback,
  withStyles,
  Collapse,
  Theme
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import Ton from "../sinn/Ton";
import Bild from "../sinn/Bild";
import Licht from "../sinn/Licht";
import { Television, Alarm, VolumeMedium, Lightbulb } from "mdi-material-ui";
import classNames from "classnames";
import * as PubSub from "pubsub-js";
import Aufwachen from "../kanal/Aufwachen";
import ButtonGroup from "./ButtonGroup";
import MenuButton from "./MenuButton";
import { Component } from "./Component";
import {
  delay,
  isLeftMouseButtonDown,
  scrollIntoViewIfNeeded,
  isVisible
} from "../utils";
import NoneCursor from "./NoneCursor";

export interface Props {}

export interface State {
  menu: boolean;
  sinn: string;
}

type ComponentClassNames =
  | "menu"
  | "menuBtn"
  | "topLayer"
  | "fill"
  | "backgroundImage"
  | "mouseMoveSelection";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  menu: {
    background: "rgba(255,255,255, 0.6)",
    height: "100vh",
    width: "100vw",
    overflow: "auto",
    paddingTop: "1%"
  },
  menuBtn: {
    float: "right"
  },
  fill: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    bottom: "0"
  },
  backgroundImage: {
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  topLayer: {
    zIndex: 10
  },
  mouseMoveSelection: {
    "-webkit-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    userSelect: "none",
    cursor: "none"
  }
});

class Menu extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      menu: false,
      sinn: "ton"
    };
  }

  private allButtons: NodeListOf<HTMLButtonElement>;
  private activeElement: HTMLButtonElement;

  public componentDidMount() {
    this.allButtons = document.querySelectorAll("button");
    this.activeElement = this.allButtons[0];

    PubSub.subscribe("menu", () => {
      this.setState({ menu: !this.state.menu });
    });
    this.subscribe("sinn");

    window.addEventListener("keydown", this.handleOnKeyDown);

    document.addEventListener("keydown", this.keyDown);
    document.addEventListener("mousemove", this.mouseMove);
    document.addEventListener("mousedown", this.mouseDown);
  }

  public componentWillUnmount() {
    window.removeEventListener("keydown", this.handleOnKeyDown);

    document.removeEventListener("keydown", this.keyDown);
    document.removeEventListener("mousemove", this.mouseMove);
    document.removeEventListener("mousedown", this.mouseDown);
  }

  private keyDown = (event: any) => {
    if (!this.state.menu) return;

    let direction: "left" | "up" | "right" | "down";
    switch (event.keyCode) {
      case 37:
        direction = "left";
        break;
      case 38:
        direction = "up";
        break;
      case 39:
        direction = "right";
        break;
      case 40:
        direction = "down";
        break;

      default:
        return;
    }

    this.changeFocus(direction);
  };

  private previousEvent: MouseEvent;

  private mouseMove = (event: MouseEvent) => {
    if (!this.state.menu) return;

    let direction: "left" | "up" | "right" | "down";

    let movementX =
      event.movementX ||
      (this.previousEvent && event.screenX - this.previousEvent.screenX);
    let movementY =
      event.movementY ||
      (this.previousEvent && event.screenY - this.previousEvent.screenY);

    this.previousEvent = event;

    if (movementX < 0) direction = "left";
    else if (movementX > 0) direction = "right";
    else if (movementY > 0) direction = "down";
    else if (movementY < 0) direction = "up";
    else return;
    this.changeFocus(direction);
  };

  private mouseDown = (event: any) => {
    if (!this.state.menu) return;

    if (this.activeElement && isLeftMouseButtonDown(event)) {
      this.activeElement.click();
    }
  };

  private setFocus() {
    if (!this.activeElement || !isVisible(this.activeElement)) {
      const btns = Array.from(this.allButtons);

      for (const btn of btns) {
        if (isVisible(btn)) {
          if (this.activeElement) this.activeElement.classList.remove("focus");

          this.activeElement = btn;
          break;
        }
      }

      if (this.activeElement) this.activeElement.classList.add("focus");
    }
  }

  private changeFocus(direction: "left" | "up" | "right" | "down") {
    this.setFocus();

    if (!this.activeElement) return;

    const tabindex = this.activeElement.getAttribute("tabindex");

    if (!tabindex) return;

    let nextElement: HTMLElement | null = null;

    switch (direction) {
      case "left":
        nextElement = this.activeElement.previousElementSibling as HTMLElement;
        break;
      case "up":
        {
          let siblings = this.previousElementSiblings(this.activeElement)
            .length;
          nextElement = this.previous(this.activeElement) as HTMLElement;
          for (
            let i = 0;
            i < siblings && nextElement && nextElement.nextElementSibling;
            i++
          ) {
            nextElement = nextElement.nextElementSibling as HTMLElement;
          }
        }
        break;
      case "right":
        nextElement = this.activeElement.nextElementSibling as HTMLElement;
        break;
      case "down":
        {
          let siblings = this.previousElementSiblings(this.activeElement)
            .length;
          nextElement = this.next(this.activeElement) as HTMLElement;
          for (
            let i = 0;
            i < siblings && nextElement && nextElement.nextElementSibling;
            i++
          ) {
            nextElement = nextElement.nextElementSibling as HTMLElement;
          }
        }
        break;

      default:
        throw "Direction not known.";
    }

    if (nextElement) {
      this.activeElement.classList.remove("focus");
      nextElement.classList.add("focus");
      this.activeElement = nextElement as HTMLButtonElement;
    }
  }

  private previousElementSiblings(element: Element | null) {
    const elements: Element[] = [];

    if (!element) return elements;

    while ((element = element.previousElementSibling)) {
      elements.push(element);
    }
    return elements;
  }

  private previous(element: Element | null): Element | null {
    if (!element) return null;

    if (element.previousElementSibling) {
      const previousElement = element.previousElementSibling.querySelector(
        "button"
      );
      scrollIntoViewIfNeeded(previousElement);
      if (previousElement && isVisible(previousElement)) return previousElement;

      if (element.previousElementSibling.previousElementSibling)
        return this.previous(element.previousElementSibling);
    }

    return this.previous(element.parentElement);
  }

  private next(element: Element | null): Element | null {
    if (!element) return null;

    if (element.nextElementSibling) {
      const nextElement = element.nextElementSibling.querySelector("button");
      scrollIntoViewIfNeeded(nextElement);
      if (nextElement && isVisible(nextElement)) return nextElement;

      if (element.nextElementSibling.nextElementSibling)
        return this.next(element.nextElementSibling);
    }

    return this.next(element.parentElement);
  }

  public handleOnKeyDown = (event: any) => {
    if (!this.state.menu) return;

    if (event.keyCode === 457) {
      if (this.state.menu) if (document.location) document.location.reload();

      this.setState({
        menu: !this.state.menu,
        sinn: "none"
      });
    } else if (event.keyCode === 403) {
      this.setState({
        menu: true,
        sinn: "ton"
      });
    } else if (event.keyCode === 404) {
      this.setState({
        menu: true,
        sinn: "bild"
      });
    } else if (event.keyCode === 405) {
      this.setState({
        menu: true,
        sinn: "licht"
      });
    } else if (event.keyCode === 406) {
      this.setState({
        menu: true,
        sinn: "alarm"
      });
    }
  };

  private clicked = false;
  private clickCounter = 0;

  public handleClick = async () => {
    this.clickCounter++;

    if (!this.state.menu) {
      this.clicked = true;
      this.setState({ menu: true });
    } else if (!this.clicked) {
      if (this.clickCounter === 2) {
        this.setState({ menu: false });
        if (document.location) document.location.reload();
      }
    }

    await delay(1000);
    this.clicked = false;
    this.clickCounter = 0;
  };

  public handleSinnChange = async (_event: any, sinn: any) => {
    this.publish("sinn", { sinn });
    this.setState({
      menu: true,
      sinn: sinn
    });
  };

  public render() {
    const { classes } = this.props;
    const { menu, sinn } = this.state;

    let collapseClass = classNames(classes.topLayer, classes.fill);

    collapseClass = classNames(
      classes.topLayer,
      classes.fill,
      classes.mouseMoveSelection
    );

    return (
      <React.Fragment>
        <Collapse in={menu} className={collapseClass}>
          <div className={classes.menu}>
            <ButtonGroup
              value={sinn}
              onChange={this.handleSinnChange}
              selection="exclusive"
            >
              <MenuButton
                title="Ton"
                icon={<VolumeMedium />}
                backgroundGradient="GreenYellow, LimeGreen"
                value="ton"
                label="A"
                labelColor="Red"
              />
              <MenuButton
                title="Bild"
                icon={<Television />}
                backgroundGradient="Lightblue, darkblue"
                value="bild"
                label="B"
                labelColor="ForestGreen"
              />
              <MenuButton
                title="Licht"
                icon={<Lightbulb />}
                backgroundGradient="Moccasin, DarkOrange"
                value="licht"
                label="C"
                labelColor="Gold"
              />
              <MenuButton
                title="Aufwachen"
                icon={<Alarm />}
                backgroundGradient="Red, LightYellow"
                value="aufwachen"
                label="D"
                labelColor="DodgerBlue"
              />
            </ButtonGroup>
            <Collapse in={sinn === "ton"}>
              <Ton />
            </Collapse>
            <Collapse in={sinn === "bild"}>
              <Bild />
            </Collapse>
            <Collapse in={sinn === "licht"}>
              <Licht />
            </Collapse>
            <Collapse in={sinn === "aufwachen"}>
              <Aufwachen />
            </Collapse>
          </div>
        </Collapse>
        <NoneCursor>
          <div
            className={classNames(classes.topLayer, classes.fill)}
            onClick={this.handleClick}
          />
        </NoneCursor>
      </React.Fragment>
    );
  }
}

export default withStyles(style)(Menu);
