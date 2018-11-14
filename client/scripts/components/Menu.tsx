import * as React from "react";
import {
  StyleRulesCallback,
  withStyles,
  Collapse,
  Typography,
  IconButton
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import Ton from "./Ton";
import Bild from "./Bild";
import Licht from "./Licht";
import { Menu as IconMenu } from "mdi-material-ui";
import classNames from "classnames";
import * as PubSub from "pubsub-js";

export interface Props {}

export interface State {
  menu: boolean;
}

type ComponentClassNames =
  | "menu"
  | "menuBtn"
  | "topLayer"
  | "fill"
  | "backgroundImage"
  | "mouseMoveSelection";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
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
    userSelect: "none",
    cursor: "none"
  }
});

class Menu extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      menu: false
    };
  }
  private first = true;

  public componentDidMount() {
    PubSub.subscribe("menu", () => {
      this.setState({ menu: !this.state.menu });
    });
  }

  public handleClick = () => {
    //  if (navigator.userAgent.indexOf("SMART-TV") === -1) {
    this.setState({ menu: !this.state.menu });
    //}
  }

  public render() {
    const { classes } = this.props;
    const { menu } = this.state;

    if (
      navigator.userAgent.indexOf("SMART-TV") !== -1 &&
      !menu &&
      !this.first
    ) {
      if (document.location) document.location.reload();
    }
    this.first = false;

    let collapseClass = classNames(classes.topLayer, classes.fill);
    // if (navigator.userAgent.indexOf("SMART-TV") !== -1) {
    //     collapseClass = classNames(classes.topLayer, classes.fill, classes.mouseMoveSelection);
    // }

    return (
      <React.Fragment>
        <Collapse in={menu} className={collapseClass}>
          <div className={classes.menu} onClick={this.handleClick}>
            <Typography variant="headline" style={{ margin: "0 1%" }}>
              Ton
            </Typography>
            <Ton />
            <Typography variant="headline" style={{ margin: "0 1%" }}>
              Bild
            </Typography>
            <Bild />
            <Typography variant="headline" style={{ margin: "0 1%" }}>
              Licht
            </Typography>
            <Licht />
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
