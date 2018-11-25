import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import * as classnames from "classnames";
import Erde from "./Erde";
import Schweiz from "./Schweiz";
import { Component, getRandomInt } from "../utils";
import FlugHintergrund from "./FlugHintergrund";
import YoutubeVideo from "./YoutubeVideo";
import YoutubePlaylist from "./YoutubePlaylist";
import Events from "./Events";
import { toViewModel } from "./Wetter";
import ImageEffect, { CanvasEffect } from "../CanvasEffects/ImageEffect";
import FireflyEffect from "../CanvasEffects/FireflyEffect";
import ReactDOM = require("react-dom");
import DayForNightEffect from "../CanvasEffects/DayForNightEffect";
import RainEffect from "../CanvasEffects/raineffect/index";
import ClearEffect from "../CanvasEffects/ClearEffect";

export interface Props {}

export interface State {
  bild: {
    bildschirm?: "aus" | "ein";
    kanal?: "wetter" | "ansehen" | "natur" | "tour" | "zusehen";
  };

  wetter: {
    wolken?: boolean;
    wind?: boolean;
    niederschlag?: boolean;
    temperatur?: number;
  };

  ansehen: {
    ort?: "schweiz" | "erde" | "weltraum";
  };

  natur: {
    szene?: "wasserfall" | "strand" | "savanne" | "aquarium" | "sonne";
  };

  tour: {
    reise?: "flug" | "umrundungErde" | "umrundungMond";
  };

  zusehen: {
    aktivitaet?: "bahnverkehr" | "flugverkehr" | "kartierung" | "malen";
  };
}

type ComponentClassNames = "root" | "fill";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {},
  fill: {
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    position: "fixed"
  }
});

class BildHintergrund extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);

    this.state = {
      bild: {},
      wetter: {},
      ansehen: {},
      natur: {},
      tour: {},
      zusehen: {}
    };
  }

  public async componentDidMount() {
    this.subscribe("sinn/bild", data => {
      console.info("sinn/bild" + data);
      return {
        bild: data
      };
    });

    this.subscribe("kanal/wetter", data => {
      const vm = toViewModel(data);
      return {
        wetter: vm
      };
    });

    this.subscribe("kanal/ansehen", data => ({
      ansehen: data
    }));

    this.subscribe("kanal/natur", data => ({
      natur: data
    }));

    this.subscribe("kanal/tour", data => ({
      tour: data
    }));

    this.subscribe("kanal/zusehen", data => ({
      zusehen: data
    }));

    const backgroundCanvas = ReactDOM.findDOMNode(
      this.refs.background
    ) as HTMLCanvasElement;
    if (!backgroundCanvas) return;
    backgroundCanvas.width = backgroundCanvas.scrollWidth;
    backgroundCanvas.height = backgroundCanvas.scrollHeight;

    const backgroundCanvasContext = backgroundCanvas.getContext("2d", {
      alpha: false
    });
    if (!backgroundCanvasContext) return;
    this.backgroundCanvasContext = backgroundCanvasContext;

    const foregroundCanvas = ReactDOM.findDOMNode(
      this.refs.foreground
    ) as HTMLCanvasElement;
    if (!foregroundCanvas) return;
    foregroundCanvas.width = foregroundCanvas.scrollWidth;
    foregroundCanvas.height = foregroundCanvas.scrollHeight;

    const foregroundCanvasContext = foregroundCanvas.getContext("2d");
    if (!foregroundCanvasContext) return;
    this.foregroundCanvasContext = foregroundCanvasContext;

    const img = await this.loadImage("/img/background/cold/cold-22.jpg");

    this.backgroundEffects.push(new ImageEffect(img, backgroundCanvasContext));
    this.backgroundEffects.push(
      new DayForNightEffect(backgroundCanvasContext, 0.5)
    );
    this.foregroundEffects.push(new ClearEffect(foregroundCanvasContext));
    this.foregroundEffects.push(new FireflyEffect(foregroundCanvasContext));

    for (const e of this.backgroundEffects) {
      e.render();
    }
    RainEffect(backgroundCanvas, foregroundCanvas);
    for (const e of this.foregroundEffects) {
      e.render();
    }

    window.addEventListener("resize", this.onResize);

    this.animationLoop((delta: number) => {
      for (const e of this.foregroundEffects) {
        e.update(delta);
      }
      return this.running;
    });
  }

  private backgroundCanvasContext: CanvasRenderingContext2D;
  private foregroundCanvasContext: CanvasRenderingContext2D;

  private running: boolean = true;

  private backgroundEffects: CanvasEffect[] = [];
  private foregroundEffects: CanvasEffect[] = [];

  public componentWillUnmount() {
    this.running = false;
    window.removeEventListener("resize", this.onResize);
  }

  private onResize = () => {
    this.backgroundCanvasContext.canvas.width = this.backgroundCanvasContext.canvas.scrollWidth;
    this.backgroundCanvasContext.canvas.height = this.backgroundCanvasContext.canvas.scrollHeight;

    this.foregroundCanvasContext.canvas.width = this.foregroundCanvasContext.canvas.scrollWidth;
    this.foregroundCanvasContext.canvas.height = this.foregroundCanvasContext.canvas.scrollHeight;
    for (const e of this.backgroundEffects) {
      e.update();
    }
  }

  private animationLoop(render: (delta: number) => boolean) {
    let running: boolean | undefined = undefined;
    let lastFrame = +new Date();
    let raf =
      (window as any).mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      (window as any).msRequestAnimationFrame ||
      (window as any).oRequestAnimationFrame;
    function loop(now: number) {
      // stop the loop if render returned false
      if (running !== false) {
        raf(loop);
        let deltaT = now - lastFrame;
        if (deltaT < 160) {
          running = render(deltaT);
        }
        lastFrame = now;
      }
    }
    loop(lastFrame);
  }

  private loadImage(src: string) {
    return new Promise<HTMLImageElement>(resolve => {
      const img = new Image();
      img.addEventListener("load", _event => {
        resolve(img);
      });
      img.src = src;
    });
  }

  public render() {
    const { classes } = this.props;
    const { bild, wetter, ansehen, natur, tour, zusehen } = this.state;
    console.info("bild:" + bild);
    let backgroundElement: any;

    if (bild.bildschirm === "aus")
      backgroundElement = (
        <div className={classes.fill} style={{ background: "black" }} />
      );
    else {
      if (bild.kanal === "wetter") {
        if (wetter.temperatur === 0)
          backgroundElement = (
            <YoutubeVideo video="mWyak0g5LLI" align="bottom" startAt={25} />
          );
        else {
          let background: string | undefined;
          let max = 0;

          switch (wetter.temperatur) {
            case 1:
              background = "cold";
              max = 26;
              break;
            case 2:
              background = "mild";
              max = 11;
              break;
            case 3:
              background = "warm";
              max = 10;
              break;
            case 4:
              background = "hot";
              max = 6;
              break;
            case 5:
              background = "very-hot";
              max = 3;
              break;
          }

          const backgroundNumber = getRandomInt(1, max);

          if (wetter.niederschlag) {
            backgroundElement = (
              <div>
                <img
                  id="src"
                  className={classnames(classes.fill)}
                  src={
                    "/img/background/" +
                    background +
                    "/" +
                    background +
                    "-" +
                    backgroundNumber +
                    ".jpg"
                  }
                />
                <canvas
                  style={{
                    top: "0",
                    left: "0",
                    right: "0",
                    width: "100%",
                    bottom: "0",
                    height: "100%",
                    position: "absolute",
                    objectFit: "cover"
                  }}
                />
              </div>
            );

            if (
              navigator.userAgent.indexOf("SMART-TV") !== -1 &&
              !(window as any).rainEffect
            ) {
              if ((window as any).rainEffectTimer)
                clearTimeout((window as any).rainEffectTimer);
              (window as any).rainEffectTimer = setTimeout(() => {
                (window as any).rainEffect = true;
                let readyStateCheckInterval = setInterval(function() {
                  if (document.readyState === "complete") {
                    clearInterval(readyStateCheckInterval);

                    console.info("Start RainEffect");
                    RainEffect(
                      document.querySelector("#src") as any,
                      document.getElementsByTagName("canvas")[0]
                    );
                  }
                }, 10);
              }, 1000);
            } else {
              if ((window as any).rainEffectTimer)
                clearTimeout((window as any).rainEffectTimer);
              (window as any).rainEffectTimer = setTimeout(() => {
                let readyStateCheckInterval = setInterval(function() {
                  if (document.readyState === "complete") {
                    clearInterval(readyStateCheckInterval);

                    console.info("Start RainEffect");
                    RainEffect(
                      document.querySelector("#src") as any,
                      document.getElementsByTagName("canvas")[0]
                    );
                  }
                }, 10);
              }, 1000);
            }
          } else
            backgroundElement = (
              <img
                id="src"
                className={classnames(classes.fill)}
                src={
                  "/img/background/" +
                  background +
                  "/" +
                  background +
                  "-" +
                  backgroundNumber +
                  ".jpg"
                }
              />
            );
        }
      } else if (bild.kanal === "ansehen") {
        if (ansehen.ort === "schweiz") backgroundElement = <Schweiz />;
        else if (ansehen.ort === "erde") backgroundElement = <Erde />;
        else if (ansehen.ort === "weltraum")
          backgroundElement = <YoutubeVideo video="5_-rh6L1jiU" />;
        else if (ansehen.ort === "spotlight")
          backgroundElement = (
            <div
              className={classnames(classes.fill)}
              style={{
                backgroundImage:
                  "url('/img/spotlight/background (" +
                  getRandomInt(1, 219) +
                  ").jpg')"
              }}
            />
          );
        else backgroundElement = <Events />;
      } else if (bild.kanal === "natur") {
        let video = "";

        if (natur.szene === "wasserfall") {
          video = "y7e-GC6oGhg";
        } else if (natur.szene === "strand") {
          video = "QgdP2tzaZHc";
        } else if (natur.szene === "savanne") {
          video = "27jtwBaYZtI";
        } else if (natur.szene === "aquarium") {
          video = "X0vK_57vQ7s";
        } else if (natur.szene === "sonne") {
          video = "2yU5CMti5S8";
        }

        backgroundElement = <YoutubeVideo video={video} />;
      } else if (bild.kanal === "tour") {
        if (tour.reise === "flug") {
          backgroundElement = <FlugHintergrund />;
        } else {
          let video = "";

          if (tour.reise === "umrundungErde") {
            video = "ddFvjfvPnqk";
          } else if (tour.reise === "umrundungMond") {
            video = "Few7FbNHS-I";
          }

          backgroundElement = <YoutubeVideo video={video} />;
        }
      } else if (bild.kanal === "zusehen") {
        if (zusehen.aktivitaet === "bahnverkehr") {
          backgroundElement = (
            <iframe
              style={{
                width: "calc(100% + 358px)",
                position: "absolute",
                top: "-40px",
                height: "calc(100% + 154px)",
                background: "black",
                border: "0px",
                left: "0"
              }}
              src={
                "http://maps.vasile.ch/transit-sbb/?map_type_id=satellite&zoom.start=11&center.x=8.7&center.y=47.3"
              }
              frameBorder="0"
            />
          );
        } else if (zusehen.aktivitaet === "flugverkehr") {
          backgroundElement = (
            <iframe
              style={{
                width: "calc(100% + 38px)",
                position: "absolute",
                top: "-47px",
                height: "calc(100% + 155px)",
                background: "black",
                border: "0px",
                left: "-39px"
              }}
              src={
                "http://www.flightradar24.com/simple_index.php?lat=46.73&lon=7.73&z=8&airports=1&size=auto"
              }
              frameBorder="0"
            />
          );
        } else if (zusehen.aktivitaet === "kartierung") {
          backgroundElement = (
            <iframe
              style={{
                width: "100%",
                position: "absolute",
                top: "0",
                height: "100%",
                background: "black",
                border: "0"
              }}
              src={"http://osmlab.github.io/show-me-the-way/"}
              frameBorder="0"
            />
          );
        } else if (zusehen.aktivitaet === "malen") {
          backgroundElement = (
            <YoutubePlaylist
              list="PLAEQD0ULngi67rwmhrkNjMZKvyCReqDV4"
              first={getRandomInt(0, 402)}
            />
          );
        } else if (zusehen.aktivitaet === "speedrun") {
          backgroundElement = (
            <YoutubePlaylist
              list="PLraFbwCoisJCmLRBm7XbM8LmxByQAIz1y"
              first={getRandomInt(0, 61)}
            />
          );
        }
      }
    }

    return (
      <div className={classes.root}>
        <canvas ref="background" className={classnames(classes.fill)} />
        <canvas ref="foreground" className={classnames(classes.fill)} />
      </div>
    );
  }
}

export default withStyles(style)(BildHintergrund);
