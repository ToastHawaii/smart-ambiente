import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  WeatherCloudy,
  WeatherWindy,
  WeatherPouring,
  WeatherFog,
  WeatherLightning,
  ViewModule,
  Teach,
  Gauge,
  GaugeLow,
  GaugeEmpty,
  Snowflake,
  WhiteBalanceSunny
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  wolken?: boolean;
  wind?: boolean;
  niederschlag?: boolean;
  nebel?: boolean;
  gewitter?: boolean;
  temperatur?: "eisig" | "kalt" | "mild" | "warm" | "heiss";
  mode?: "vorhersage" | "manuell";
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
        "linear-gradient(to bottom left, rgba(173, 216, 230, 0.8), rgba(255, 215, 0, 0.2))",
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

class Wetter extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/wetter");
  }

  public handleModeChange = (_event: any, mode: any) => {
    this.publish("kanal/wetter", { mode });
  }

  public handleWolkenChange = (_event: any, _value: any, wolken: any) => {
    this.publish("kanal/wetter", { wolken });
  }

  public handleWindChange = (_event: any, _value: any, wind: any) => {
    this.publish("kanal/wetter", { wind });
  }

  public handleNiederschlagChange = (
    _event: any,
    _value: any,
    niederschlag: any
  ) => {
    this.publish("kanal/wetter", { niederschlag });
  }

  public handleNebelChange = (_event: any, _value: any, nebel: any) => {
    this.publish("kanal/wetter", { nebel });
  }

  public handleGewitterChange = (_event: any, _value: any, gewitter: any) => {
    this.publish("kanal/wetter", { gewitter });
  }

  public handleTemperaturChange = (_event: any, temperatur: any) => {
    this.publish("kanal/wetter", { temperatur });
  }

  public render() {
    const { classes } = this.props;
    const {
      wolken,
      wind,
      niederschlag,
      nebel,
      gewitter,
      temperatur,
      mode
    } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={mode}
          onChange={this.handleModeChange}
          selection="exclusive"
        >
          <MenuButton
            icon={<Teach />}
            title="Vorhersage"
            backgroundImage="/img/Vorhersage.png"
            value="vorhersage"
          />
          <MenuButton
            icon={<ViewModule />}
            title="Manuell"
            backgroundImage="/img/Manuell.png"
            value="manuell"
          />
        </ButtonGroup>
        <Collapse in={mode === "manuell"}>
          <ButtonGroup
            selection="multiple"
            style={{
              marginTop: "1%"
            }}
          >
            <MenuButton
              onChange={this.handleWolkenChange}
              selected={wolken}
              icon={<WeatherCloudy />}
              title="Wolken"
              backgroundImage="/img/Wolken.jpg"
            />
            <MenuButton
              onChange={this.handleWindChange}
              selected={wind}
              icon={<WeatherWindy />}
              title="Wind"
              backgroundImage="/img/Wind.gif"
            />
            <MenuButton
              onChange={this.handleNiederschlagChange}
              selected={niederschlag}
              icon={<WeatherPouring />}
              title="Niederschlag"
              backgroundImage="/img/Niederschlag.jpg"
            />
            <MenuButton
              onChange={this.handleNebelChange}
              selected={nebel}
              icon={<WeatherFog />}
              title="Nebel"
              backgroundImage="/img/Nebel.jpg"
            />
            <MenuButton
              onChange={this.handleGewitterChange}
              selected={gewitter}
              icon={<WeatherLightning />}
              title="Gewitter"
              backgroundImage="/img/Gewitter.jpg"
            />{" "}
          </ButtonGroup>
          <ButtonGroup
            value={temperatur}
            onChange={this.handleTemperaturChange}
            selection="exclusive"
            style={{
              marginTop: "1%"
            }}
          >
            <MenuButton
              icon={<Snowflake />}
              title="Eisig"
              backgroundImage="/img/Eisig.jpg"
              value="eisig"
            />
            <MenuButton
              icon={<GaugeEmpty />}
              title="Kalt"
              backgroundImage="/img/Kalt.jpg"
              value="kalt"
            />
            <MenuButton
              icon={<GaugeLow />}
              title="Mild"
              backgroundImage="/img/Mild.jpg"
              value="mild"
            />
            <MenuButton
              icon={<Gauge />}
              title="Warm"
              backgroundImage="/img/Warm.jpg"
              value="warm"
            />
            <MenuButton
              icon={<WhiteBalanceSunny />}
              title="Heiss"
              backgroundImage="/img/Heiss.jpg"
              value="heiss"
            />
          </ButtonGroup>
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Wetter);