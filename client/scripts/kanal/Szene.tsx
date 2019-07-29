import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  WeatherWindy,
  LighthouseOn,
  WeatherSunsetDown,
  WeatherSunsetUp
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  szene?: "wind" | "sonnenuntergang" | "sonnenaufgang" | "leuchturm";
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
        "linear-gradient(to left bottom, rgba(205, 133, 63, 0.8), rgba(0, 128, 0, 0.2))",
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

class Szene extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/szene");
  }

  public handleChange = (_event: any, szene: any) => {
    this.publish("kanal/szene", { szene });
  };

  public render() {
    const { classes } = this.props;
    const { szene } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={szene}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Wind"
            icon={<WeatherWindy />}
            backgroundImage="/img/button/scene/wind.png"
            value="wind"
          />
          <MenuButton
            title="Leuchturm"
            icon={<LighthouseOn />}
            backgroundImage="/img/button/scene/leuchturm.png"
            value="leuchturm"
          />
          <MenuButton
            title="Sonnenuntergang"
            icon={<WeatherSunsetDown />}
            backgroundImage="/img/button/scene/sonnenuntergang.png"
            value="sonnenuntergang"
          />{" "}
          <MenuButton
            title="Sonnenaufgang"
            icon={<WeatherSunsetUp />}
            backgroundImage="/img/button/scene/sonnenuntergang.png"
            value="sonnenaufgang"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Szene);
