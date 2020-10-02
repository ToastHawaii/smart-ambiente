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
  EmoticonTongue,
  EmoticonPoop,
  EmoticonNeutral,
  EmoticonHappy,
  Emoticon,
  EmoticonDevil,
  EmoticonExcited,
  EmoticonCool,
  EmoticonWink
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  stil?: "modern" | "klassisch";
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

class Musik extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/musik");
  }

  public handleChange = (_event: any, stil: any) => {
    this.publish("kanal/musik", { stil });
  };

  public render() {
    const { classes } = this.props;
    const { stil } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={stil}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Interesse"
            icon={<EmoticonHappy />}
            backgroundImage="/img/button/musik/Interesse.jpg"
            value="interesse"
            style={{ marginLeft: "17.666%" }}
          />
          <MenuButton
            title="Gelassenheit"
            icon={<EmoticonNeutral />}
            backgroundImage="/img/button/musik/Gelassenheit.jpg"
            value="gelassenheit"
          />
          <MenuButton
            title="Akzeptanz"
            icon={<EmoticonTongue />}
            backgroundImage="/img/button/musik/Akzeptanz.jpg"
            value="akzeptanz"
          />
        </ButtonGroup>
        <ButtonGroup
          value={stil}
          onChange={this.handleChange}
          selection="exclusive"
          style={{ marginTop: "1%" }}
        >
          <MenuButton
            title="Groll"
            icon={<EmoticonPoop />}
            backgroundImage="/img/button/musik/Groll.jpg"
            value="groll"
          />
          <MenuButton
            title="Erwartung"
            icon={<Emoticon />}
            backgroundImage="/img/button/musik/Erwartung.png"
            value="erwartung"
          />
          <MenuButton
            title="Freude"
            icon={<EmoticonExcited />}
            backgroundImage="/img/button/musik/Freude.png"
            value="freude"
          />
          <MenuButton
            title="Vertrauen"
            icon={<EmoticonWink />}
            backgroundImage="/img/button/musik/Vertrauen.jpg"
            value="vertrauen"
          />
        </ButtonGroup>
        <ButtonGroup
          value={stil}
          onChange={this.handleChange}
          selection="exclusive"
          style={{
            marginTop: "1%"
          }}
        >
          <MenuButton
            title="Wut"
            icon={<EmoticonDevil />}
            backgroundImage="/img/button/musik/Wut.png"
            value="wut"
          />
          <MenuButton
            title="Umsicht"
            icon={<EmoticonCool />}
            backgroundImage="/img/button/musik/Umsicht.jpg"
            value="umsicht"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Musik);
