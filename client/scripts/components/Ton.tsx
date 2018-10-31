import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  VolumeOff,
  VolumeLow,
  VolumeMedium,
  VolumeHigh,
  WeatherPartlycloudy,
  Music,
  Newspaper,
  Television,
  Pistol
} from "mdi-material-ui";
import Musik from "./Musik";
import Wetter from "./Wetter";
import ButtonGroup from "./ButtonGroup";
import { Component } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  lautstaerke?: "aus" | "leise" | "normal" | "laut" | "bild";
  kanal?: "wetter" | "nachrichten" | "musik";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class Ton extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("sinn/ton");
  }

  public handleLautstaerkeChange = (_event: any, lautstaerke: any) => {
    this.publish("sinn/ton", { lautstaerke });
  };

  public handleKanalChange = async (_event: any, kanal: any) => {
    this.publish("sinn/ton", { kanal });
  };

  public render() {
    const { classes } = this.props;
    const { lautstaerke, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={lautstaerke}
          onChange={this.handleLautstaerkeChange}
          selection="exclusive"
        >
          <MenuButton
            title="Aus"
            icon={<VolumeOff />}
            backgroundGradient="LightGray, Black"
            value="aus"
          />
          <MenuButton
            title="Leise"
            icon={<VolumeLow />}
            backgroundGradient="LightYellow, GreenYellow"
            value="leise"
          />
          <MenuButton
            title="Normal"
            icon={<VolumeMedium />}
            backgroundGradient="GreenYellow, LimeGreen"
            value="normal"
          />
          <MenuButton
            title="Laut"
            icon={<VolumeHigh />}
            backgroundGradient="LimeGreen, DarkGreen"
            value="laut"
          />
          <MenuButton
            title="Bild"
            icon={<Television />}
            backgroundGradient="LightBlue, DarkBlue"
            value="bild"
          />
        </ButtonGroup>
        <Collapse in={lautstaerke !== "aus" && lautstaerke !== "bild"}>
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
              backgroundGradient="LightBlue, Gold"
              value="wetter"
            />
            <MenuButton
              title="Nachrichten"
              icon={<Newspaper />}
              backgroundGradient="Bisque, DimGray"
              value="nachrichten"
            />
            <MenuButton
              title="Krimi"
              icon={<Pistol />}
              backgroundImage="/img/Krimi.png"
              value="krimi"
            />
            <MenuButton
              title="Musik"
              icon={<Music />}
              backgroundGradient="RosyBrown, MidnightBlue"
              value="musik"
            />
          </ButtonGroup>
          {
            <Collapse in={kanal === "wetter"}>
              <Wetter />
            </Collapse>
          }
          {
            <Collapse in={kanal === "musik"}>
              <Musik />
            </Collapse>
          }
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Ton);
