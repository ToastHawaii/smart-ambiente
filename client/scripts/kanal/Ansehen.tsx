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
  Earth,
  ImageFilterHdr,
  Star,
  Calendar,
  Blackberry,
  Sprout
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  ort?: "schweiz" | "erde" | "weltraum" | "ereignisse";
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
        "linear-gradient(to left bottom, rgba(173, 255, 47, 0.8), rgba(34, 139, 34, 0.2))",
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

class Ansehen extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/ansehen");
  }

  public handleChange = (_event: any, ort: any) => {
    this.publish("kanal/ansehen", { ort });
  };

  public render() {
    const { classes } = this.props;
    const { ort } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={ort}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Aquarium"
            icon={<Blackberry />}
            backgroundImage="/img/button/zusehen/Aquarium.jpg"
            value="aquarium"
          />
          <MenuButton
            title="Schweiz"
            icon={<ImageFilterHdr />}
            backgroundGradient="#FF0000, #AB2720"
            value="schweiz"
          />
          <MenuButton
            title="Erde"
            icon={<Earth />}
            backgroundGradient="SkyBlue, SeaGreen"
            value="erde"
          />
          <MenuButton
            title="Weltraum"
            icon={<Star />}
            backgroundGradient="DarkBlue, Black"
            value="weltraum"
          />
          <MenuButton
            title="Ereignisse"
            icon={<Calendar />}
            backgroundGradient="DarkRed, DarkSlateGray"
            value="ereignisse"
          />
          <MenuButton
            title="Saison"
            icon={<Sprout />}
            backgroundGradient="DarkGreen, DarkSlateGray"
            value="saison"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Ansehen);
