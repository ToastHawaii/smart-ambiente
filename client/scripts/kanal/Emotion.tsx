import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  EmoticonNeutral,
  EmoticonExcited,
  EmoticonCool,
  EmoticonAngry,
  EmoticonKiss,
  EmoticonDead,
  EmoticonCry,
  EmoticonDevil
} from "mdi-material-ui";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

export interface Props {}

export interface State {
  emotion?: string;
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
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
            title="Wut"
            icon={<EmoticonDevil />}
            backgroundGradient="#ff8c8c, #d40000"
            value="wut"
          />
          <MenuButton
            title="Umsicht"
            icon={<EmoticonCool />}
            backgroundGradient="#ffc48c, #ff7d00"
            value="umsicht"
          />
          <MenuButton
            title="Ekstase"
            icon={<EmoticonExcited />}
            backgroundGradient="#ffffb1, #ffe854"
            value="ekstase"
          />
          <MenuButton
            title="Bewunderung"
            icon={<EmoticonKiss />}
            backgroundGradient="#85f285, #00b400"
            value="bewunderung"
          />
        </ButtonGroup>
        <ButtonGroup
          value={emotion}
          onChange={this.handleChange}
          selection="exclusive"
          style={{ marginTop: "1%" }}
        >
          <MenuButton
            title="Schrecken"
            icon={<EmoticonDead />}
            backgroundGradient="#8cc68c, #007f00"
            value="schrecken"
          />
          <MenuButton
            title="Erstaunen"
            icon={<EmoticonNeutral />}
            backgroundGradient="#a5dbff, #0089e0"
            value="erstaunen"
          />
          <MenuButton
            title="Kummer"
            icon={<EmoticonCry />}
            backgroundGradient="#8c8cff, #0000c8"
            value="kummer"
          />
          <MenuButton
            title="Abscheu"
            icon={<EmoticonAngry />}
            backgroundGradient="#ffc6ff, #de00de"
            value="abscheu"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Emotion);
