import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
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
