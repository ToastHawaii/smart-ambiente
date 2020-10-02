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
  IconButton,
  Theme
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import Ton from "../sinn/Ton";
import Bild from "../sinn/Bild";
import Licht from "../sinn/Licht";
import {
  Television,
  Alarm,
  VolumeMedium,
  Lightbulb,
  Menu as IconMenu
} from "mdi-material-ui";
import classNames from "classnames";
import * as PubSub from "pubsub-js";
import Aufwachen from "../kanal/Aufwachen";
import ButtonGroup from "./ButtonGroup";
import MenuButton from "./MenuButton";
import { Component } from "./Component";

export interface Props {}

export interface State {
  menu: boolean;
  sinn: string;
}

type ComponentClassNames =
  | "menu"
  | "menuBtn"
  | "topLayer"
  | "fill"
  | "backgroundImage"
  | "mouseMoveSelection";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  menu: {
    background: "rgba(255,255,255, 0.6)",
    height: "100vh",
    width: "100vw",
    overflow: "auto"
  },
  menuBtn: {
    float: "right"
  },
  fill: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    bottom: "0"
  },
  backgroundImage: {
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  topLayer: {
    zIndex: 10
  },
  mouseMoveSelection: {
    "-webkit-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    userSelect: "none"
  }
});

class Menu extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      menu: false,
      sinn: "ton"
    };
  }

  public componentDidMount() {
    PubSub.subscribe("menu", () => {
      this.setState({ menu: !this.state.menu });
    });
    this.subscribe("sinn");
  }

  public handleSinnChange = async (_event: any, sinn: any) => {
    this.publish("sinn", { sinn });
    this.setState({
      menu: true,
      sinn: sinn
    });
  };

  public handleClick = () => {
    this.setState({ menu: !this.state.menu });
  };

  public render() {
    const { classes } = this.props;
    const { menu, sinn } = this.state;

    let collapseClass = classNames(classes.topLayer, classes.fill);

    collapseClass = classNames(
      classes.topLayer,
      classes.fill,
      classes.mouseMoveSelection
    );

    return (
      <React.Fragment>
        <Collapse in={menu} className={collapseClass}>
          <div
            className={classes.menu}
            onClick={this.handleClick}
            style={{ paddingTop: "1%" }}
          >
            <ButtonGroup
              value={sinn}
              onChange={this.handleSinnChange}
              selection="exclusive"
            >
              <MenuButton
                title="Ton"
                icon={<VolumeMedium />}
                backgroundGradient="GreenYellow, LimeGreen"
                value="ton"
              />
              <MenuButton
                title="Bild"
                icon={<Television />}
                backgroundGradient="Lightblue, darkblue"
                value="bild"
              />
              <MenuButton
                title="Licht"
                icon={<Lightbulb />}
                backgroundGradient="Moccasin, DarkOrange"
                value="licht"
              />
              <MenuButton
                title="Aufwachen"
                icon={<Alarm />}
                backgroundGradient="Red, LightYellow"
                value="aufwachen"
              />
            </ButtonGroup>
            <Collapse in={sinn === "ton"}>
              <Ton />
            </Collapse>
            <Collapse in={sinn === "bild"}>
              <Bild />
            </Collapse>
            <Collapse in={sinn === "licht"}>
              <Licht />
            </Collapse>
            <Collapse in={sinn === "aufwachen"}>
              <Aufwachen />
            </Collapse>
          </div>
        </Collapse>
        <IconButton
          color="inherit"
          className={classNames(classes.topLayer, classes.menuBtn)}
          onClick={this.handleClick}
        >
          <IconMenu />
        </IconButton>
      </React.Fragment>
    );
  }
}

export default withStyles(style)(Menu);
