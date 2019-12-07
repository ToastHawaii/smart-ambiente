import * as React from "react";
import {
  StyleRulesCallback,
  withStyles,
  Collapse,
  Theme
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  WeatherCloudy,
  WeatherWindy,
  WeatherPouring,
  ViewModule,
  Teach,
  Gauge,
  GaugeLow,
  // GaugeEmpty,
  Snowflake,
  WhiteBalanceSunny,
  Fire,
  WeatherNight,
  WeatherSunny,
  ThemeLightDark,
  GaugeFull,
  GaugeEmpty,
  Piano
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";
import { getJson } from "../utils";

export function toViewModel(
  model: {
    zeit: number;
    wolken: number;
    wind: number;
    niederschlag: number;
    radio: number;
    temperatur: number;
    mode: "vorhersage" | "manuell";
  },
  image?: { src: string; effects: string[] }
) {
  return {
    zeit: model.zeit,
    wolken: model.wolken,
    wind: model.wind,
    niederschlag: model.niederschlag,
    radio: model.radio,
    temperatur: model.temperatur,
    mode: model.mode,
    image: image
  };
}

export function fromViewModel(viewModel: {
  zeit: number;
  wolken: number;
  wind: number;
  niederschlag: number;
  radio: number;
  temperatur: number;
  mode: "vorhersage" | "manuell";
}) {
  return {
    zeit: viewModel.zeit,
    wolken: viewModel.wolken,
    wind: viewModel.wind,
    niederschlag: viewModel.niederschlag,
    radio: viewModel.radio,
    temperatur: viewModel.temperatur,
    mode: viewModel.mode
  };
}

export interface Props {}

export interface State {
  zeit?: number;
  wolken?: number;
  wind?: number;
  niederschlag?: number;
  radio?: number;
  temperatur?: number;
  mode?: "vorhersage" | "manuell";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
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
  };

  public handleWolkenChange = (_event: any, _value: any, wolken: boolean) => {
    this.publish("kanal/wetter", { wolken: wolken ? 1 : 0 }, fromViewModel);
  };

  public handleWindChange = (_event: any, _value: any, wind: boolean) => {
    this.publish("kanal/wetter", { wind: wind ? 1 : 0 }, fromViewModel);
  };

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
  };

  public handleRadioChange = (_event: any, _value: any, radio: boolean) => {
    this.publish("kanal/wetter", { radio: radio ? 1 : 0 }, fromViewModel);
  };

  public handleTemperaturChange = (_event: any, temperatur: number) => {
    this.publish("kanal/wetter", { temperatur }, fromViewModel);
  };

  public handleZeitChange = (_event: any, zeit: number) => {
    this.publish("kanal/wetter", { zeit }, fromViewModel);
  };

  public render() {
    const { classes } = this.props;
    const { wolken, wind, niederschlag, radio, temperatur, mode } = this.state;

    let zeit: number;

    if (this.state.zeit !== undefined && this.state.zeit <= 2 * (1 / 3))
      zeit = 0;
    else if (this.state.zeit !== undefined && this.state.zeit <= 2 * (2 / 3))
      zeit = 1;
    else zeit = 2;

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
            value={zeit}
            onChange={this.handleZeitChange}
            selection="exclusive"
            style={{
              marginTop: "1%"
            }}
          >
            <MenuButton
              icon={<WeatherNight />}
              title="Nacht"
              selected={zeit <= 2 * (1 / 3)}
              backgroundGradient="Blue, MidnightBlue"
              value={0}
            />
            <MenuButton
              icon={<ThemeLightDark />}
              title="Dämmerung"
              selected={zeit <= 2 * (2 / 3)}
              backgroundGradient="Orange, Red"
              value={1}
            />
            <MenuButton
              icon={<WeatherSunny />}
              title="Tag"
              selected={zeit <= 2}
              backgroundGradient="Yellow, Orange"
              value={2}
            />
          </ButtonGroup>
          <ButtonGroup
            selection="multiple"
            style={{
              marginTop: "1%"
            }}
          >
            <MenuButton
              onChange={this.handleWolkenChange}
              selected={typeof wolken !== "undefined" && wolken >= 0.1}
              icon={<WeatherCloudy />}
              title="Wolken"
              backgroundImage="/img/button/wetter/Wolken.jpg"
            />
            <MenuButton
              onChange={this.handleWindChange}
              selected={typeof wind !== "undefined" && wind >= 0.1}
              icon={<WeatherWindy />}
              title="Wind"
              backgroundImage="/img/button/wetter/Wind.gif"
            />
            <MenuButton
              onChange={this.handleNiederschlagChange}
              selected={typeof niederschlag !== "undefined" && niederschlag >= 0.1}
              icon={<WeatherPouring />}
              title="Niederschlag"
              backgroundImage="/img/button/wetter/Niederschlag.jpg"
            />
            <MenuButton
              onChange={this.handleRadioChange}
              selected={typeof radio !== "undefined" && radio >= 0.1}
              icon={<Piano />}
              title="Radio"
              backgroundImage="/img/button/wetter/Radio.jpg"
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
              title="Mässig Kalt"
              backgroundImage="/img/button/wetter/maessig-kalt.jpg"
              value={0}
            />
            <MenuButton
              icon={<GaugeEmpty />}
              title="Kühl"
              backgroundImage="/img/button/wetter/kuehl.jpg"
              value={1}
            />
            <MenuButton
              icon={<GaugeLow />}
              title="Mild"
              backgroundImage="/img/button/wetter/mild.jpg"
              value={2}
            />
            <MenuButton
              icon={<Gauge />}
              title="Mässig Warm"
              backgroundImage="/img/button/wetter/maessig-warm.jpg"
              value={3}
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
              icon={<GaugeFull />}
              title="Warm"
              backgroundImage="/img/button/wetter/warm.jpg"
              value={4}
            />
            <MenuButton
              icon={<WhiteBalanceSunny />}
              title="Sehr Warm"
              backgroundImage="/img/button/wetter/sehr-warm.jpg"
              value={5}
            />
            <MenuButton
              icon={<Fire />}
              title="Heiss"
              backgroundImage="/img/button/wetter/heiss.jpg"
              value={6}
            />
          </ButtonGroup>
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Wetter);
