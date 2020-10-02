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
import { hot } from "react-hot-loader";
import * as classnames from "classnames";
import classNames from "classnames";
import * as PubSub from "pubsub-js";
import HideCursor from "./HideCursor";
import BildHintergrund from "./BildHintergrund";
import Menu from "./Menu";
import SamsungMenu from "./SamsungMenu";

export interface Props {}

export interface State {}

type ComponentClassNames = "app" | "topLayer" | "fill";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  app: {
    overflow: "hidden",
    background: "#333"
  },

  fill: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    bottom: "0"
  },
  topLayer: {
    zIndex: 10
  }
});

class App extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public handleClick = () => {
    PubSub.publish("menu", {});
  }

  public render() {
    const { classes } = this.props;
    const {} = this.state;

    return (
      <div className={classnames(classes.app, classes.fill)}>
        <div className={classes.fill}>
          <BildHintergrund />
        </div>
        {navigator.userAgent.indexOf("SMART-TV") === -1 ? (
          <React.Fragment>
            <HideCursor>
              <div
                className={classNames(classes.topLayer, classes.fill)}
                onClick={this.handleClick}
              />
            </HideCursor>
            <Menu />
          </React.Fragment>
        ) : (
          <SamsungMenu />
        )}
      </div>
    );
  }
}

export default hot(module)(withStyles(style)(App));
