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

import * as React from "react";
import { animate } from "../utils";
import * as ReactDOM from "react-dom";
import { CanvasEffect } from "./CanvasEffects/ImageEffect";

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

          const dpi = window.devicePixelRatio;
          c.width = c.scrollWidth * dpi;
          c.height = c.scrollHeight * dpi;

          for (const effect of layer.effects)
            if (effect.render) await effect.render(c, canvas);

          canvas.push(c);
          i++;
        }
      }

      const canvas: HTMLCanvasElement[] = [];
      let ii = 0;
      for (const layer of this.props.layers) {
        let updated = false;
        const c = ReactDOM.findDOMNode(
          this.refs["canvas" + ii]
        ) as HTMLCanvasElement;

        for (const effect of layer.effects) {
          if (effect.update && updated) await effect.update(c, canvas);

          if (effect.step) {
            updated = true;
            await effect.step(c, deltaT, canvas);
          }
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

      const dpi = window.devicePixelRatio;
      c.width = c.scrollWidth * dpi;
      c.height = c.scrollHeight * dpi;

      for (const effect of layer.effects)
        if (effect.render) await effect.render(c, canvas);

      canvas.push(c);
      i++;
    }
  };

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
