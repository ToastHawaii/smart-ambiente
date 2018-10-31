import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  Television,
  TelevisionOff,
  WeatherPartlycloudy,
  Webcam,
  Routes,
  Coffee,
  Tree
} from "mdi-material-ui";
import Wetter from "./Wetter";
import Ansehen from "./Ansehen";
import Natur from "./Natur";
import Tour from "./Tour";
import Zusehen from "./Zusehen";
import ButtonGroup from "./ButtonGroup";
import { Component } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  bildschirm?: "aus" | "ein";
  kanal?: "wetter" | "ansehen" | "natur" | "tour" | "zusehen";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class Bild extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public async componentDidMount() {
    this.subscribe("sinn/bild");
  }

  public handleBildschirmChange = (_event: any, bildschirm: any) => {
    this.publish("sinn/bild", { bildschirm });
  }

  public handleKanalChange = (_event: any, kanal: any) => {
    this.publish("sinn/bild", { kanal });
  }

  public render() {
    const { classes } = this.props;
    const { bildschirm, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={bildschirm}
          onChange={this.handleBildschirmChange}
          selection="exclusive"
        >
          <MenuButton
            title="Aus"
            icon={<TelevisionOff />}
            backgroundGradient="Lightgray, black"
            value="aus"
          />
          <MenuButton
            title="Ein"
            icon={<Television />}
            backgroundGradient="Lightblue, darkblue"
            value="ein"
          />
        </ButtonGroup>

        <Collapse in={bildschirm !== "aus"}>
          <ButtonGroup
            value={kanal}
            onChange={this.handleKanalChange}
            selection="exclusive"
            style={{
              marginTop: "1%"
            }}
          >
            <MenuButton
              title="Wetter"
              icon={<WeatherPartlycloudy />}
              backgroundGradient="lightblue, gold"
              value="wetter"
            />
            <MenuButton
              title="Ansehen"
              icon={<Webcam />}
              backgroundGradient="GreenYellow, ForestGreen"
              value="ansehen"
            />
            <MenuButton
              title="Natur"
              icon={<Tree />}
              backgroundGradient="Peru, Green"
              value="natur"
            />
            <MenuButton
              title="Tour"
              icon={<Routes />}
              backgroundGradient="Aqua, DarkBlue"
              value="tour"
            />
            <MenuButton
              title="Zusehen"
              icon={<Coffee />}
              backgroundGradient="Gold, Green"
              value="zusehen"
            />
          </ButtonGroup>

          {
            <Collapse in={kanal === "wetter"}>
              <Wetter />
            </Collapse>
          }
          {
            <Collapse in={kanal === "ansehen"}>
              <Ansehen />
            </Collapse>
          }
          {
            <Collapse in={kanal === "natur"}>
              <Natur />
            </Collapse>
          }
          {
            <Collapse in={kanal === "tour"}>
              <Tour />
            </Collapse>
          }
          {
            <Collapse in={kanal === "zusehen"}>
              <Zusehen />
            </Collapse>
          }
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Bild);
