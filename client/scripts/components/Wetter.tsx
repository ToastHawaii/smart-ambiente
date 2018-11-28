import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  WeatherCloudy,
  WeatherWindy,
  WeatherPouring,
  ViewModule,
  Teach,
  Gauge,
  GaugeLow,
  GaugeEmpty,
  Snowflake,
  WhiteBalanceSunny,
  Fire
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "./Component";
import MenuButton from "./MenuButton";
import { getJson } from "../utils";

export function toViewModel(
  model: {
    zeit: number;
    wolken: number;
    wind: number;
    niederschlag: number;
    temperatur: number;
    mode: "vorhersage" | "manuell";
  },
  image?: { src: string }
) {
  return {
    zeit: model.zeit,
    wolken: model.wolken >= 1 ? true : false,
    wind: model.wind >= 1 ? true : false,
    niederschlag: model.niederschlag,
    temperatur: model.temperatur,
    mode: model.mode,
    image: image
  };
}

export function fromViewModel(viewModel: {
  zeit: number;
  wolken: boolean;
  wind: boolean;
  niederschlag: number;
  temperatur: number;
  mode: "vorhersage" | "manuell";
}) {
  return {
    zeit: viewModel.zeit,
    wolken: viewModel.wolken ? 1 : 0,
    wind: viewModel.wind ? 1 : 0,
    niederschlag: viewModel.niederschlag,
    temperatur: viewModel.temperatur,
    mode: viewModel.mode
  };
}

export interface Props {}

export interface State {
  zeit?: number;
  wolken?: boolean;
  wind?: boolean;
  niederschlag?: number;
  temperatur?: number;
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
    this.subscribe("kanal/wetter", async data => {
      return toViewModel(data, await getJson("/api/kanal/wetter/image"));
    });
  }

  public handleModeChange = (_event: any, mode: any) => {
    this.publish("kanal/wetter", { mode }, fromViewModel);
  }

  public handleWolkenChange = (_event: any, _value: any, wolken: boolean) => {
    this.publish("kanal/wetter", { wolken: wolken ? 1 : 0 }, fromViewModel);
  }

  public handleWindChange = (_event: any, _value: any, wind: boolean) => {
    this.publish("kanal/wetter", { wind: wind ? 1 : 0 }, fromViewModel);
  }

  public handleNiederschlagChange = (
    _event: any,
    _value: any,
    niederschlag: boolean
  ) => {
    this.publish(
      "kanal/wetter",
      { niederschlag: niederschlag ? 1 : 0 },
      fromViewModel
    );
  }

  public handleTemperaturChange = (_event: any, temperatur: number) => {
    this.publish("kanal/wetter", { temperatur }, fromViewModel);
  }

  public render() {
    const { classes } = this.props;
    const { wolken, wind, niederschlag, temperatur, mode } = this.state;

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
            backgroundImage="/img/button/wetter/Vorhersage.png"
            value="vorhersage"
          />
          <MenuButton
            icon={<ViewModule />}
            title="Manuell"
            backgroundImage="/img/button/wetter/Manuell.png"
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
              backgroundImage="/img/button/wetter/Wolken.jpg"
            />
            <MenuButton
              onChange={this.handleWindChange}
              selected={wind}
              icon={<WeatherWindy />}
              title="Wind"
              backgroundImage="/img/button/wetter/Wind.gif"
            />
            <MenuButton
              onChange={this.handleNiederschlagChange}
              selected={niederschlag && niederschlag >= 0.1}
              icon={<WeatherPouring />}
              title="Niederschlag"
              backgroundImage="/img/button/wetter/Niederschlag.jpg"
            />
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
              backgroundImage="/img/button/wetter/Eisig.jpg"
              value={0}
            />
            <MenuButton
              icon={<GaugeEmpty />}
              title="Kalt"
              backgroundImage="/img/button/wetter/Kalt.jpg"
              value={1}
            />
            <MenuButton
              icon={<GaugeLow />}
              title="Mild"
              backgroundImage="/img/button/wetter/Mild.jpg"
              value={2}
            />
            <MenuButton
              icon={<Gauge />}
              title="Warm"
              backgroundImage="/img/button/wetter/Warm.jpg"
              value={3}
            />
            <MenuButton
              icon={<WhiteBalanceSunny />}
              title="Heiss"
              backgroundImage="/img/button/wetter/Heiss.jpg"
              value={4}
            />
            <MenuButton
              icon={<Fire />}
              title="Sehr Heiss"
              backgroundImage="/img/button/wetter/SehrHeiss.jpg"
              value={5}
            />
          </ButtonGroup>
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Wetter);
