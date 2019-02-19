import * as React from "react";
import {
  Music,
  Theater,
  BookOpenPageVariant,
  FoodApple,
  TransitTransfer,
  Untappd,
  GlassCocktail,
  Tree,
  EmoticonExcited,
  VideoVintage,
  Silverware,
  ImageOutline,
  Run,
  Brush,
  Voice
} from "mdi-material-ui";
import { StyleRulesCallback, withStyles, Typography } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { TileEvent, eventsRepository } from "./Repository";
import { getRandomInt } from "../../utils";

export interface Props {
  val: TileEvent;
}

export interface State {
  details: boolean;
  switch: boolean;
  hintergrundPosition: string;
  time: number;
  val: TileEvent;
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class EventTile extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  public constructor(props: any) {
    super(props);

    this.state = {
      details: false,
      switch: false,
      hintergrundPosition: "top left",
      time: 0,
      val: props.val
    };
  }

  public componentWillUnmount() {
    // use timeoutId from the state to clear the interval
    clearTimeout(this.timeoutId);
  }

  private counter: number = 0;
  private timeoutId: any;

  public timer() {
    const time =
      getRandomInt(1, 2) *
      (this.state.val.groesse === 1 || !!this.state.details ? 10000 : 20000);

    let hintergrundPosition: string;

    if (this.counter % 4 === 0) {
      hintergrundPosition = "center center";
    } else if (this.counter % 4 === 1) {
      hintergrundPosition = "center center";
    } else if (this.counter % 4 === 2) {
      hintergrundPosition = "bottom right";
    } else {
      hintergrundPosition = "top left";
    }

    this.timeoutId = setTimeout(() => {
      this.timer();
    }, time);

    this.counter++;
    if (this.counter % 3 === 0 && getRandomInt(1, 2) === 1) {
      this.setState({
        switch: true
      });
      setTimeout(() => {
        const newValue = eventsRepository.switch(this.state.val);
        this.setState({
          switch: false,
          val: newValue,
          details: false
        });
        this.counter = 0;
      }, 500);
    } else {
      this.setState({
        details: !this.state.details,
        hintergrundPosition: hintergrundPosition,
        time: time
      });
    }
  }

  public componentDidMount() {
    const time = getRandomInt(1, 2) * 10000;
    this.timeoutId = setTimeout(() => {
      this.timer();
    }, time);
  }

  public render() {
    const {
      groesse,
      hatDetails,
      titel,
      beschreibung,
      hintergrundFarbe,
      textFarbe,
      datum,
      zeit,
      ort,
      quelle,
      kategorie,
      icon,
      bild
    } = this.state.val;
    const { details, hintergrundPosition, time } = this.state;
    let i: any;
    switch (icon) {
      case "Musik":
        i = <Music />;
        break;
      case "Theater":
        i = <Theater />;
        break;
      case "Führung":
        i = <TransitTransfer />;
        break;
      case "Einkaufen":
        i = <FoodApple />;
        break;
      case "Bildung":
        i = <BookOpenPageVariant />;
        break;
      case "Film":
        i = <VideoVintage />;
        break;
      case "Festival":
        i = <Untappd />;
        break;
      case "Party":
        i = <GlassCocktail />;
        break;
      case "Essen":
        i = <Silverware />;
        break;
      case "Bewegung":
        i = <Run />;
        break;
      case "Ausstellung":
        i = <ImageOutline />;
        break;
      case "Comedy":
        i = <EmoticonExcited />;
        break;
      case "Natur":
        i = <Tree />;
        break;
      case "Gestalten":
        i = <Brush />;
        break;
      case "Sprache":
        i = <Voice />;
        break;
    }

    return (
      <div
        style={{
          float: "left",
          margin: "5px",
          width: groesse === 1 ? "180px" : "370px",
          height: "180px",
          overflow: "hidden",
          boxSizing: "border-box",
          transform: "rotateX(" + (this.state.switch ? "90deg" : "0") + ")",
          transition: "transform 0.5s ease-in"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: hintergrundFarbe,
            color: textFarbe,
            padding: "10px",
            position: "relative",
            display: "table",
            boxSizing: "border-box",
            transform:
              "translateY(" + (details && hatDetails ? "-180px" : "0") + ")",
            transition: "transform 1s"
          }}
        >
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(25% - 5px)",
              left: "5px",
              top: "5px",
              position: "absolute"
            }}
          >
            {i}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(75% - 5px)",
              right: "5px",
              top: "5px",
              position: "absolute",
              textAlign: "right"
            }}
          >
            {kategorie}
          </Typography>

          <Typography
            component="span"
            variant="subheading"
            color="inherit"
            style={{
              verticalAlign: "middle",
              display: "table-cell",
              textAlign: "center",
              paddingTop: "10px",
              paddingBottom: "10px"
            }}
          >
            {titel}
          </Typography>

          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {datum}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              right: "5px",
              textAlign: "right",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {ort}
          </Typography>
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            color: textFarbe,
            padding: "10px",
            position: "relative",
            display: "table",
            boxSizing: "border-box",
            transform:
              "translateY(" + (details && hatDetails ? "-180px" : "0") + ")",
            transition: "transform 1s"
          }}
        >
          <div
            style={{
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
              backgroundImage: "url('" + bild + "')",
              backgroundColor: hintergrundFarbe,
              backgroundSize: "cover",
              position: "absolute",
              opacity: bild ? 0.75 : 1,
              zIndex: -1,
              transition: details
                ? "background-position " + time / 1000 + "s linear"
                : "background-position 1s linear 1s",
              backgroundPosition: hintergrundPosition
            }}
          />
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(100% - 10px)",
              left: "5px",
              top: "5px",
              position: "absolute"
            }}
          >
            {titel}
          </Typography>
          <Typography
            component="p"
            variant="body1"
            color="inherit"
            style={{
              verticalAlign: "middle",
              display: "table-cell",
              textAlign: "center",
              paddingTop: "10px",
              paddingBottom: "10px",
              msWordBreak: "break-all",
              wordBreak: "break-all",
              WebkitHyphens: "auto",
              MozHyphens: "auto",
              msHyphens: "auto",
              hyphens: "auto"
            }}
          >
            {beschreibung}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {zeit}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              right: "5px",
              textAlign: "right",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {quelle}
          </Typography>
        </div>
      </div>
    );
  }
}

export default withStyles(style)(EventTile);
