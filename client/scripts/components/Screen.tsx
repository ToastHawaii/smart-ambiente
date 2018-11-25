import * as React from "react";
import { animate } from "../utils";
import ReactDOM = require("react-dom");
import { CanvasEffect } from "../CanvasEffects/ImageEffect";

interface Props {
  layers: {
    effects: CanvasEffect[];
  }[];
}
interface State {}

class Screen extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    console.info("[Screen] constructor");
  }

  private refreshed: boolean;
  private running: boolean = true;

  public async componentDidMount() {
    console.info("[Screen] componentDidMount");

    window.addEventListener("resize", this.onResize);

    animate(async deltaT => {
      if (this.refreshed) {
        this.refreshed = false;
        const canvas: HTMLCanvasElement[] = [];
        let i = 0;
        for (const layer of this.props.layers) {
          const c = ReactDOM.findDOMNode(
            this.refs["canvas" + i]
          ) as HTMLCanvasElement;
          c.width = c.scrollWidth;
          c.height = c.scrollHeight;

          for (const effect of layer.effects) {
            await effect.render(c, canvas);
          }

          canvas.push(c);
          i++;
        }
      }

      const canvas: HTMLCanvasElement[] = [];
      let ii = 0;
      for (const layer of this.props.layers) {
        const c = ReactDOM.findDOMNode(
          this.refs["canvas" + ii]
        ) as HTMLCanvasElement;

        for (const effect of layer.effects) {
          await effect.update(c, deltaT, canvas);
        }

        canvas.push(c);
        ii++;
      }
      return this.running;
    });
  }

  public componentWillUnmount() {
    console.info("[Screen] componentWillUnmount");
    this.running = false;
    window.removeEventListener("resize", this.onResize);
  }

  private onResize = async () => {
    console.info("[Screen] onResize");
    const canvas: HTMLCanvasElement[] = [];
    let i = 0;
    for (const layer of this.props.layers) {
      const c = ReactDOM.findDOMNode(
        this.refs["canvas" + i]
      ) as HTMLCanvasElement;
      c.width = c.scrollWidth;
      c.height = c.scrollHeight;

      for (const effect of layer.effects) {
        await effect.resize(c, canvas);
      }

      canvas.push(c);
      i++;
    }
  }

  public render() {
    this.refreshed = true;
    console.info("[Screen] render");
    const canvas: any[] = [];
    let i = 0;
    for (const _layer of this.props.layers) {
      canvas.push(
        <canvas
          key={"canvas" + i}
          ref={"canvas" + i}
          style={{
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            position: "fixed"
          }}
        />
      );
      i++;
    }

    return canvas;
  }
}

export default Screen;
