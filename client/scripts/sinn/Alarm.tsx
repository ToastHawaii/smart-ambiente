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
  ThemeLightDark,
  WeatherNight,
  WeatherSunny,
  KeyboardOutline,
  GamepadVariant,
  Beach
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  zeit?: "05:43" | "06:43" | "07:43" | "08:43";
  tage?: "1-5" | "0-6";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class Alarm extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/alarm");
  }

  public handleZeitChange = (_event: any, zeit: any) => {
    this.publish("kanal/alarm", { zeit });
  };
  public handleTageChange = (_event: any, tage: any) => {
    this.publish("kanal/alarm", { tage });
  };

  public render() {
    const { classes } = this.props;
    const { zeit, tage } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={zeit}
          onChange={this.handleZeitChange}
          selection="exclusive"
        >
          <MenuButton
            icon={<WeatherNight />}
            title="06:30"
            selected={zeit === "05:43"}
            backgroundGradient="Blue, MidnightBlue"
            value="05:43"
          />
          <MenuButton
            icon={<ThemeLightDark />}
            title="07:30"
            selected={zeit === "06:43"}
            backgroundGradient="Orange, Red"
            value="06:43"
          />
          <MenuButton
            icon={<WeatherSunny />}
            title="08:30"
            selected={zeit === "07:43"}
            backgroundGradient="Yellow, Orange"
            value="07:43"
          />
          <MenuButton
            icon={<Beach />}
            title="09:30"
            selected={zeit === "08:43"}
            backgroundGradient="LightBlue, Gold"
            value="08:43"
          />
        </ButtonGroup>
        <ButtonGroup
          value={tage}
          onChange={this.handleTageChange}
          selection="exclusive"
          style={{
            marginTop: "1%"
          }}
        >
          <MenuButton
            icon={<KeyboardOutline />}
            title="Mo bis Fr"
            selected={tage === "1-5"}
            backgroundGradient="LightBlue, DarkBlue"
            value="1-5"
          />
          <MenuButton
            icon={<GamepadVariant />}
            title="Mo bis So"
            selected={tage === "0-6"}
            backgroundGradient="LimeGreen, DarkGreen"
            value="0-6"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Alarm);
