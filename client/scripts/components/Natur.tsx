import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  Pinwheel,
  Fire,
  WeatherWindy,
  Water,
  Waves,
  WeatherSunset,
  Leaf,
  Drag,
  Fish,
  Terrain,
  Docker,
  ViewParallel,
  Beer,
  RadiatorDisabled,
  LighthouseOn
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "./Component";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  szene?:
    | "feuer"
    | "wind"
    | "regen"
    | "nordlicht"
    | "sonnenuntergang"
    | "bach"
    | "wasserfall"
    | "see"
    | "berg"
    | "meer"
    | "windspiel"
    | "bar"
    | "windturbine"
    | "bruecke"
    | "leuchturm";
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

class Natur extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/natur");
  }

  public handleChange = (_event: any, szene: any) => {
    console.info("kanal/natur" + szene);
    this.publish("kanal/natur", { szene });
  }

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
            title="Feuer"
            icon={<Fire />}
            backgroundImage="/img/button/natur/feuer.png"
            value="feuer"
          />
          <MenuButton
            title="Wind"
            icon={<WeatherWindy />}
            backgroundImage="/img/button/natur/wind.png"
            value="wind"
          />
          <MenuButton
            title="Regen"
            icon={<Water />}
            backgroundImage="/img/button/natur/regen.png"
            value="regen"
          />
          <MenuButton
            title="Nordlicht"
            icon={<Waves />}
            backgroundImage="/img/button/natur/nordlicht.png"
            value="nordlicht"
          />
          <MenuButton
            title="Sonnenuntergang"
            icon={<WeatherSunset />}
            backgroundImage="/img/button/natur/sonnenuntergang.png"
            value="sonnenuntergang"
          />
        </ButtonGroup>
        <ButtonGroup
          value={szene}
          onChange={this.handleChange}
          selection="exclusive"
          style={{
            marginTop: "1%"
          }}
        >
          <MenuButton
            title="Bach"
            icon={<Leaf />}
            backgroundImage="/img/button/natur/bach.png"
            value="bach"
          />
          <MenuButton
            title="Wasserfall"
            icon={<Drag />}
            backgroundImage="/img/button/natur/wasserfall.png"
            value="wasserfall"
          />
          <MenuButton
            title="See"
            icon={<Fish />}
            backgroundImage="/img/button/natur/see.png"
            value="see"
          />
          <MenuButton
            title="Berg"
            icon={<Terrain />}
            backgroundImage="/img/button/natur/berg.png"
            value="berg"
          />
          <MenuButton
            title="Meer"
            icon={<Docker />}
            backgroundImage="/img/button/natur/meer.png"
            value="meer"
          />
        </ButtonGroup>
        <ButtonGroup
          value={szene}
          onChange={this.handleChange}
          selection="exclusive"
          style={{
            marginTop: "1%"
          }}
        >
          <MenuButton
            title="Windspiel"
            icon={<ViewParallel />}
            backgroundImage="/img/button/natur/windspiel.png"
            value="windspiel"
          />
          <MenuButton
            title="Bar"
            icon={<Beer />}
            backgroundImage="/img/button/natur/bar.png"
            value="bar"
          />
          <MenuButton
            title="Windturbine"
            icon={<Pinwheel />}
            backgroundImage="/img/button/natur/windturbine.png"
            value="windturbine"
          />
          <MenuButton
            title="Brücke"
            icon={<RadiatorDisabled />}
            backgroundImage="/img/button/natur/bruecke.png"
            value="bruecke"
          />
          <MenuButton
            title="Leuchturm"
            icon={<LighthouseOn />}
            backgroundImage="/img/button/natur/leuchturm.png"
            value="leuchturm"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Natur);
