import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { hot } from "react-hot-loader";
import * as classnames from "classnames";

import HideCursor from "./HideCursor";
import BildHintergrund from "./BildHintergrund";
import classNames = require("classnames");
import Menu from "./Menu";

export interface Props {}

export interface State {}

type ComponentClassNames = "app" | "topLayer" | "fill" | "backgroundImage";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
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
  backgroundImage: {
    backgroundSize: "cover",
    backgroundPosition: "center"
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
    PubSub.publish("menuStateChange", {});
  }

  public render() {
    const { classes } = this.props;
    const {} = this.state;

    return (
      <div className={classnames(classes.app, classes.fill)}>
        <div className={classes.fill}>
          <BildHintergrund />
        </div>
        <HideCursor>
          <div
            className={classNames(classes.topLayer, classes.fill)}
            onClick={this.handleClick}
          />
        </HideCursor>
        <Menu />
      </div>
    );
  }
}

export default hot(module)(withStyles(style)<Props>(App));
