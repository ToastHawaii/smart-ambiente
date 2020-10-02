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
import { Alarm, AlarmOff } from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";
import AlarmComponent from "../sinn/Alarm";

export interface Props {}

export interface State {
  aktiv?: "aus" | "an";
  kanal?: "alarm";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class Aufwachen extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("sinn/aufwachen");
  }

  public handleAktivChange = (_event: any, aktiv: any) => {
    this.publish("sinn/aufwachen", { aktiv });
  };

  public render() {
    const { classes } = this.props;
    const { aktiv, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={aktiv}
          onChange={this.handleAktivChange}
          selection="exclusive"
          style={{ paddingTop: "1%" }}
        >
          <MenuButton
            title="Natürlich"
            icon={<AlarmOff />}
            backgroundGradient="lightgray, black"
            value="aus"
          />
          <MenuButton
            title="Unterstützt"
            icon={<Alarm />}
            backgroundGradient="Red, LightYellow"
            value="an"
          />
        </ButtonGroup>
        <Collapse
          in={aktiv !== "aus"}
          style={{
            marginTop: "1%"
          }}
        >
          <Collapse in={kanal === "alarm"}>
            <AlarmComponent />
          </Collapse>
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Aufwachen);
