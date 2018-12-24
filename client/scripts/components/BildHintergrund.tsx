import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import Erde from "./Erde";
import Schweiz from "./Schweiz";
import { getRandomInt, scale, getJson } from "../utils";
import { Component } from "./Component";
import FlugHintergrund from "./FlugHintergrund";
import YoutubeVideo from "./YoutubeVideo";
import YoutubePlaylist from "./YoutubePlaylist";
import Events from "./Events";
import { toViewModel } from "./Wetter";
import Screen from "./Screen";
import RainEffect from "../CanvasEffects/RainEffect";
import DayForNightEffect from "../CanvasEffects/DayForNightEffect";
import FireflyEffect from "../CanvasEffects/FireflyEffect";
import ClearEffect from "../CanvasEffects/ClearEffect";
import ShimmerEffect from "../CanvasEffects/ShimmerEffect";
import InsectEffect from "../CanvasEffects/InsectEffect";
import BrightnessEffect from "../CanvasEffects/BrightnessEffect";
import StarsEffect from "../CanvasEffects/StarsEffect";
import AnimatedImageEffect from "../CanvasEffects/AnimatedImageEffect";
import ImageEffect, { CanvasEffect } from "../CanvasEffects/ImageEffect";
import SnowfallEffect from "../CanvasEffects/SnowfallEffect";
import LowPerformanceDeviceSnowfallEffect from "../CanvasEffects/LowPerformanceDeviceSnowfallEffect";
import LoopVideo from "./LoopVideo";

export interface Props {}

export interface State {
  bild: {
    bildschirm?: "aus" | "ein";
    kanal?: "wetter" | "ansehen" | "natur" | "tour" | "zusehen";
  };

  wetter: {
    zeit?: number;
    wolken?: number;
    wind?: number;
    niederschlag?: number;
    temperatur?: number;
    image?: { src: string; effects: string[] };
  };

  ansehen: {
    ort?: "winter" | "schweiz" | "erde" | "weltraum";
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

  public componentDidMount() {
    this.subscribe("sinn/bild", data => {
      console.info("sinn/bild" + data);
      return {
        bild: data
      };
    });

    this.subscribe("kanal/wetter", async data => {
      const vm = toViewModel(data, await getJson("/api/kanal/wetter/image"));
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
          backgroundElement = <LoopVideo src="video/fireplace" />;
        else if (wetter.image) {
          const weather = this.extractWeather(wetter);

          const effects = this.extractEffects(wetter);

          const layers: { effects: CanvasEffect[] }[] = [
            {
              effects: [
                !wetter.image.src.toUpperCase().endsWith(".GIF")
                  ? new ImageEffect("/img/weather/" + wetter.image.src)
                  : new AnimatedImageEffect("/img/weather/" + wetter.image.src)
              ]
            }
          ];

          if (effects.brightness)
            layers[layers.length - 1].effects.push(
              new BrightnessEffect(wetter.wolken)
            );

          if (!weather.tag && effects.dayForNight)
            layers[layers.length - 1].effects.push(
              new DayForNightEffect(wetter.zeit)
            );

          if (!weather.tag && !weather.wolken && effects.stars)
            layers[layers.length - 1].effects.push(
              new StarsEffect(
                "/img/weather/" + wetter.image.src,
                ...effects.starsMargin
              )
            );

          if (weather.niederschlag && effects.rain)
            layers.push({
              effects: [
                new RainEffect(
                  scale(wetter.niederschlag || 0.1, 0.1, 1, 0.01, 1)
                )
              ]
            });

          if (weather.wind && effects.shimmer)
            layers[layers.length - 1].effects.push(
              new ShimmerEffect(scale(wetter.wind || 0.1, 0.1, 1, 0.01, 1))
            );

          if (
            !weather.niederschlag &&
            !weather.wind &&
            weather.tag &&
            effects.insect
          )
            layers.push({
              effects: [new ClearEffect(), new InsectEffect()]
            });

          if (
            !weather.niederschlag &&
            !weather.wind &&
            !weather.tag &&
            effects.firefly
          )
            layers.push({
              effects: [new ClearEffect(), new FireflyEffect()]
            });

          backgroundElement = <Screen layers={layers} />;
        }
      } else if (bild.kanal === "ansehen") {
        if (ansehen.ort === "winter") {
          const layers: { effects: CanvasEffect[] }[] = [
            {
              effects: [
                new ImageEffect("/img/winter.jpg"),
                new DayForNightEffect(0),
                document.body.clientWidth > 1280
                  ? new SnowfallEffect()
                  : new LowPerformanceDeviceSnowfallEffect()
              ]
            }
          ];

          backgroundElement = <Screen layers={layers} />;
        } else if (ansehen.ort === "schweiz") backgroundElement = <Schweiz />;
        else if (ansehen.ort === "erde") backgroundElement = <Erde />;
        else if (ansehen.ort === "weltraum")
          backgroundElement = <YoutubeVideo video="5_-rh6L1jiU" />;
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

    return <div className={classes.root}>{backgroundElement}</div>;
  }

  private extractEffects(wetter: {
    image?: { src: string; effects: string[] } | undefined;
  }) {
    const e: string[] = (wetter.image || { effects: [] }).effects;
    const effects = {
      brightness: e.indexOf("brightness") >= 0,
      dayForNight: e.indexOf("dayfornight") >= 0,
      shimmer: e.indexOf("shimmer") >= 0,
      rain: e.indexOf("rain") >= 0,
      insect: e.indexOf("insect") >= 0,
      firefly: e.indexOf("firefly") >= 0,
      stars: e.filter(v => v.startsWith("stars")).length > 0,
      starsMargin:
        e.filter(v => v.startsWith("stars")).length > 0
          ? e
              .filter(v => v.startsWith("stars"))[0]
              .substring(5)
              .split(";")
              .map(v => parseFloat(v))
          : []
    };

    return effects;
  }

  private extractWeather(wetter: {
    zeit?: number | undefined;
    wolken?: number | undefined;
    wind?: number | undefined;
    niederschlag?: number | undefined;
  }) {
    return {
      wolken: wetter.wolken !== undefined && wetter.wolken > 0.2,
      tag: wetter.zeit !== undefined && wetter.zeit > 1,
      wind: wetter.wind !== undefined && wetter.wind >= 0.1,
      niederschlag:
        wetter.niederschlag !== undefined && wetter.niederschlag >= 0.1
    };
  }
}

export default withStyles(style)(BildHintergrund);
