import * as React from "react";
import { Sprout, Theater, TransitTransfer } from "mdi-material-ui";
import { StyleRulesCallback, withStyles, Typography } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { TileEvent, saisonRepository } from "./Repository";
import { getRandomInt } from "../../utils";

export interface Props {
  val: TileEvent;
}

export interface State {
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
    const time = getRandomInt(1, 2) * 10000;

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
        const newValue = saisonRepository.switch(this.state.val);
        this.setState({
          switch: false,
          val: newValue
        });
        this.counter = 0;
      }, 500);
    } else {
      this.setState({
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
      titel,
      hintergrundFarbe,
      textFarbe,
      datum,
      icon,
      bild
    } = this.state.val;
    const { hintergrundPosition, time } = this.state;
    let i: any;
    switch (icon) {
      case "Gemüse":
        i = <Sprout />;
        break;
      case "Theater":
        i = <Theater />;
        break;
      case "Führung":
        i = <TransitTransfer />;
        break;
    }

    return (
      <div
        style={{
          float: "left",
          margin: "5px",
          width: "180px",
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
            color: textFarbe,
            padding: "10px",
            position: "relative",
            display: "table",
            boxSizing: "border-box",
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
              transition: "background-position " + time / 1000 + "s linear",
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
              left: "5px",
              top: "5px",
              position: "absolute"
            }}
          >
            {i}
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
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {datum}
          </Typography>
        </div>
      </div>
    );
  }
}

export default withStyles(style)(EventTile);
