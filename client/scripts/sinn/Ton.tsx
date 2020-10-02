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
import {
  StyleRulesCallback,
  withStyles,
  Collapse,
  Theme
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  VolumeOff,
  VolumeLow,
  VolumeMedium,
  VolumeHigh,
  WeatherPartlyCloudy,
  Music,
  Newspaper,
  Television,
  Pistol,
  Tree
} from "mdi-material-ui";
import Musik from "../kanal/Musik";
import Wetter from "../kanal/Wetter";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";
import Natur from "../kanal/Natur";

export interface Props {}

export interface State {
  lautstaerke?: "aus" | "leise" | "normal" | "laut" | "bild";
  kanal?: "wetter" | "natur" | "nachrichten" | "musik";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class Ton extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("sinn/ton");
  }

  public handleLautstaerkeChange = (_event: any, lautstaerke: any) => {
    this.publish("sinn/ton", { lautstaerke });
  };

  public handleKanalChange = async (_event: any, kanal: any) => {
    this.publish("sinn/ton", { kanal });
  };

  public render() {
    const { classes } = this.props;
    const { lautstaerke, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={lautstaerke}
          onChange={this.handleLautstaerkeChange}
          selection="exclusive"
          style={{ paddingTop: "1%" }}
        >
          <MenuButton
            title="Aus"
            icon={<VolumeOff />}
            backgroundGradient="LightGray, Black"
            value="aus"
          />
          <MenuButton
            title="Leise"
            icon={<VolumeLow />}
            backgroundGradient="LightYellow, GreenYellow"
            value="leise"
          />
          <MenuButton
            title="Normal"
            icon={<VolumeMedium />}
            backgroundGradient="GreenYellow, LimeGreen"
            value="normal"
          />
          <MenuButton
            title="Laut"
            icon={<VolumeHigh />}
            backgroundGradient="LimeGreen, DarkGreen"
            value="laut"
          />
          <MenuButton
            title="Bild"
            icon={<Television />}
            backgroundGradient="LightBlue, DarkBlue"
            value="bild"
          />
        </ButtonGroup>
        <Collapse in={lautstaerke !== "aus" && lautstaerke !== "bild"}>
          <ButtonGroup
            value={kanal}
            onChange={this.handleKanalChange}
            selection="exclusive"
            style={{
              marginTop: "1%"
            }}
          >
            <MenuButton
              title="Wetter"
              icon={<WeatherPartlyCloudy />}
              backgroundGradient="LightBlue, Gold"
              value="wetter"
            />
            <MenuButton
              title="Natur"
              icon={<Tree />}
              backgroundGradient="Peru, Green"
              value="natur"
            />
            <MenuButton
              title="Nachrichten"
              icon={<Newspaper />}
              backgroundGradient="Bisque, DimGray"
              value="nachrichten"
            />
            <MenuButton
              title="Krimi"
              icon={<Pistol />}
              backgroundImage="/img/button/ton/Krimi.png"
              value="krimi"
            />
            <MenuButton
              title="Musik"
              icon={<Music />}
              backgroundGradient="RosyBrown, MidnightBlue"
              value="musik"
            />
          </ButtonGroup>
          {
            <Collapse in={kanal === "wetter"}>
              <Wetter />
            </Collapse>
          }
          {
            <Collapse in={kanal === "natur"}>
              <Natur />
            </Collapse>
          }
          {
            <Collapse in={kanal === "musik"}>
              <Musik />
            </Collapse>
          }
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Ton);
