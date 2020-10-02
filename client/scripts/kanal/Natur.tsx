// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

import * as React from "react";
import { StyleRulesCallback, withStyles, Theme } from "@material-ui/core";
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
  Beer,
  RadiatorDisabled,
  LighthouseOn,
  WeatherLightning,
  Ladybug,
  FlowerTulip,
  Home
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  szene?:
    | "feuer"
    | "wind"
    | "regen"
    | "gewitter"
    | "nordlicht"
    | "sonnenuntergang"
    | "teich"
    | "bach"
    | "wasserfall"
    | "see"
    | "berg"
    | "meer"
    | "haus"
    | "garten"
    | "bar"
    | "windturbine"
    | "bruecke"
    | "leuchturm";
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
    this.publish("kanal/natur", { szene });
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
            title="Gewitter"
            icon={<WeatherLightning />}
            backgroundImage="/img/button/natur/gewitter.png"
            value="gewitter"
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
            title="Teich"
            icon={<Ladybug />}
            backgroundImage="/img/button/natur/teich.png"
            value="teich"
          />
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
            title="Haus"
            icon={<Home />}
            backgroundImage="/img/button/natur/haus.png"
            value="haus"
          />
          <MenuButton
            title="Garten"
            icon={<FlowerTulip />}
            backgroundImage="/img/button/natur/garten.png"
            value="garten"
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
