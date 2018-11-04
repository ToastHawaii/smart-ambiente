import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { Airplane, Train, Map, Brush, GamepadVariant } from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  aktivitaet?: "bahnverkehr" | "flugverkehr" | "kartierung" | "malen";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {
    marginTop: "0.5%",
    marginBottom: "0.5%",
    paddingTop: "0.5%",
    paddingBottom: "0.5%",
    position: "relative",
    "&:before": {
      background:
        "linear-gradient(to left bottom, rgba(255, 215, 0, 0.8), rgba(0, 128, 0, 0.2))",
      "-webkit-filter": "blur(5px)",
      "-moz-filter": "blur(5px)",
      "-o-filter": "blur(5px)",
      "-ms-filter": "blur(5px)",
      filter: "blur(5px)",
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "0",
      top: "0",
      content: '""'
    }
  }
});

class Entspannung extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/zusehen");
  }

  public handleChange = (_event: any, aktivitaet: any) => {
    this.publish("kanal/zusehen", { aktivitaet });
  }

  public render() {
    const { classes } = this.props;
    const { aktivitaet } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={aktivitaet}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Bahnverkehr"
            icon={<Train />}
            backgroundImage="/img/Bahnverkehr.jpg"
            value="bahnverkehr"
          />
          <MenuButton
            title="Flugverkehr"
            icon={<Airplane />}
            backgroundImage="/img/Flugverkehr.jpg"
            value="flugverkehr"
          />
          <MenuButton
            title="Kartierung"
            icon={<Map />}
            backgroundImage="/img/Kartierung.png"
            value="kartierung"
          />
          <MenuButton
            title="Malen"
            icon={<Brush />}
            backgroundImage="/img/Malen.jpg"
            value="malen"
          />
          <MenuButton
            title="Speedrun"
            icon={<GamepadVariant />}
            backgroundImage="/img/Speedrun.png"
            value="speedrun"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Entspannung);
