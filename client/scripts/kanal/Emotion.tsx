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
  EmoticonNeutral,
  EmoticonExcited,
  EmoticonDead,
  EmoticonCry,
  EmoticonSad,
  EmoticonWink,
  Emoticon,
  EmoticonPoop
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  emotion?: string;
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
        "linear-gradient(to bottom left, rgba(188, 143, 143, 0.8), rgba(25, 25, 112, 0.2))",
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

class Emotion extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/emotion");
  }

  public handleChange = (_event: any, emotion: any) => {
    this.publish("kanal/emotion", { emotion });
  };

  public render() {
    const { classes } = this.props;
    const { emotion } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={emotion}
          onChange={this.handleChange}
          selection="exclusive"
          style={{ marginTop: "1%" }}
        >
          <MenuButton
            title="Groll"
            icon={<EmoticonPoop />}
            backgroundGradient="#ff8c8c, #d40000"
            value="groll"
          />
          <MenuButton
            title="Erwartung"
            icon={<Emoticon />}
            backgroundGradient="#ffc48c, #ff7d00"
            value="erwartung"
          />
          <MenuButton
            title="Freude"
            icon={<EmoticonExcited />}
            backgroundGradient="#ffffb1, #ffe854"
            value="freude"
          />
          <MenuButton
            title="Vertrauen"
            icon={<EmoticonWink />}
            backgroundGradient="#85f285, #00b400"
            value="vertrauen"
          />
        </ButtonGroup>
        <ButtonGroup
          value={emotion}
          onChange={this.handleChange}
          selection="exclusive"
          style={{ marginTop: "1%" }}
        >
          <MenuButton
            title="Angst"
            icon={<EmoticonDead />}
            backgroundGradient="#8cc68c, #007f00"
            value="angst"
          />
          <MenuButton
            title="Überraschung"
            icon={<EmoticonNeutral />}
            backgroundGradient="#a5dbff, #0089e0"
            value="überraschung"
          />
          <MenuButton
            title="Traurigkeit"
            icon={<EmoticonCry />}
            backgroundGradient="#8c8cff, #0000c8"
            value="traurigkeit"
          />
          <MenuButton
            title="Abneigung"
            icon={<EmoticonSad />}
            backgroundGradient="#ffc6ff, #de00de"
            value="abneigung"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Emotion);
