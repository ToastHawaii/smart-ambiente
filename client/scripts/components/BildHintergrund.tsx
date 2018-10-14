import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import * as classnames from "classnames";
import * as PubSub from "pubsub-js";
import Erde from "./Erde";
import Schweiz from "./Schweiz";
import RainEffect from "../raineffect/index";
import { getJson } from "../utils";
import FlugHintergrund from "./FlugHintergrund";
import YoutubeVideo from "./YoutubeVideo";
import YoutubePlaylist from "./YoutubePlaylist";
import Events from "./Events";

export interface Props {}

export interface State {
  bild: {
    bildschirm?: "aus" | "ein";
    kanal?: "wetter" | "ansehen" | "natur" | "tour" | "zusehen";
  };

  wetter: {
    wolken?: false;
    wind?: false;
    niederschlag?: false;
    nebel?: false;
    gewitter?: false;
    temperatur?: "eisig" | "kalt" | "mild" | "warm" | "heiss";
  };

  ansehen: {
    ort?: "schweiz" | "erde" | "weltraum";
  };

  natur: {
    szene?: "wasserfall" | "strand" | "savanne" | "aquarium" | "sonne";
  };

  tour: {
    reise?:
      | "fahrtSommer"
      | "fahrtWinter"
      | "flug"
      | "umrundungErde"
      | "umrundungMond";
  };

  zusehen: {
    aktivitaet?: "bahnverkehr" | "flugverkehr" | "kartierung" | "malen";
  };
}

type ComponentClassNames = "root" | "fill" | "backgroundImage";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {
    marginTop: "1%"
  },
  fill: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    bottom: "0",
    objectFit: "cover",
    width: "100%",
    height: "100%"
  },
  backgroundImage: {
    backgroundSize: "cover",
    backgroundPosition: "center"
  }
});

class BildHintergrund extends React.Component<
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
    getJson("/api/sinn/bild").then((data: any) => {
      this.setState({ bild: data });
    });

    getJson("/api/kanal/wetter").then((data: any) => {
      this.setState({ wetter: data });
    });

    getJson("/api/kanal/ansehen").then((data: any) => {
      this.setState({ ansehen: data });
    });

    getJson("/api/kanal/natur").then((data: any) => {
      this.setState({ natur: data });
    });

    getJson("/api/kanal/tour").then((data: any) => {
      this.setState({ tour: data });
    });

    getJson("/api/kanal/zusehen").then((data: any) => {
      this.setState({ zusehen: data });
    });

    PubSub.subscribe("bildStateChange", (_message: any, data: any) => {
      this.setState({ bild: data });
    });

    PubSub.subscribe("wetterStateChange", (_message: any, data: any) => {
      this.setState({ wetter: data });
    });

    PubSub.subscribe("ansehenStateChange", (_message: any, data: any) => {
      this.setState({ ansehen: data });
    });

    PubSub.subscribe("naturStateChange", (_message: any, data: any) => {
      this.setState({ natur: data });
    });

    PubSub.subscribe("tourStateChange", (_message: any, data: any) => {
      this.setState({ tour: data });
    });

    PubSub.subscribe("zusehenStateChange", (_message: any, data: any) => {
      this.setState({ zusehen: data });
    });
  }

  public randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public render() {
    const { classes } = this.props;
    const { bild, wetter, ansehen, natur, tour, zusehen } = this.state;

    let backgroundElement: any;

    if (bild.bildschirm === "aus")
      backgroundElement = (
        <div className={classes.fill} style={{ background: "black" }} />
      );
    else {
      if (bild.kanal === "wetter") {
        if (wetter.temperatur === "eisig" && !wetter.gewitter && !wetter.nebel)
          backgroundElement = (
            <YoutubeVideo video="mWyak0g5LLI" align="bottom" startAt={25} />
          );
        else {
          let background: string | undefined = wetter.temperatur;
          let max = 0;

          if (wetter.gewitter || wetter.nebel) {
            background = "severe";
            max = 3;
          } else
            switch (wetter.temperatur) {
              case "kalt":
                background = "cold";
                max = 26;
                break;
              case "mild":
                max = 11;
                break;
              case "warm":
                max = 10;
                break;
              case "heiss":
                background = "hot";
                max = 6;
                break;
            }

          const backgroundNumber = this.randomIntFromInterval(1, max);

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
                  width="1"
                  height="1"
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "0"
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
                  this.randomIntFromInterval(1, 219) +
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
              first={this.randomIntFromInterval(0, 402)}
            />
          );
        } else if (zusehen.aktivitaet === "speedrun") {
          backgroundElement = (
            <YoutubePlaylist
              list="PLraFbwCoisJCmLRBm7XbM8LmxByQAIz1y"
              first={this.randomIntFromInterval(0, 61)}
            />
          );
        }
      }
    }

    return <div className={classes.root}>{backgroundElement}</div>;
  }
}

export default withStyles(style)<Props>(BildHintergrund);
