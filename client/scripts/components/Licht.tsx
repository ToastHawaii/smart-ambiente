import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  Lightbulb,
  LightbulbOutline,
  WeatherPartlycloudy,
  ThemeLightDark,
  LightbulbOn,
  WeatherSunsetUp,
  WeatherSunsetDown
} from "mdi-material-ui";
import Wetter from "./Wetter";
import ButtonGroup from "./ButtonGroup";
import { Component } from "./Component";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  helligkeit?: "aus" | "wenig" | "viel";
  kanal?: "wetter" | "tageslicht";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class Licht extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("sinn/licht");
  }

  public handleHelligkeitChange = (_event: any, helligkeit: any) => {
    this.publish("sinn/licht", { helligkeit });
  };

  public handleKanalChange = (_event: any, kanal: any) => {
    this.publish("sinn/licht", { kanal });
  };

  public render() {
    const { classes } = this.props;
    const { helligkeit, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={helligkeit}
          onChange={this.handleHelligkeitChange}
          selection="exclusive"
        >
          <MenuButton
            title="Aus"
            icon={<LightbulbOutline />}
            backgroundGradient="lightgray, black"
            value="aus"
          />
          <MenuButton
            title="Wenig"
            icon={<Lightbulb />}
            backgroundGradient="Moccasin, DarkOrange"
            value="wenig"
          />
          <MenuButton
            title="Viel"
            icon={<LightbulbOn />}
            backgroundGradient="LightYellow, Yellow"
            value="viel"
          />
        </ButtonGroup>
        <Collapse
          in={helligkeit !== "aus"}
          style={{
            marginTop: "1%"
          }}
        >
          <ButtonGroup
            value={kanal}
            onChange={this.handleKanalChange}
            selection="exclusive"
          >
            <MenuButton
              title="Wetter"
              icon={<WeatherPartlycloudy />}
              backgroundGradient="LightBlue, Gold"
              value="wetter"
            />
            <MenuButton
              title="Tageslicht"
              icon={<ThemeLightDark />}
              backgroundGradient="LightYellow, Orange"
              value="tageslicht"
            />
            <MenuButton
              title="Sonnenaufgang"
              icon={<WeatherSunsetUp />}
              backgroundGradient="Red, LightYellow"
              value="sonnenaufgang"
            />
            <MenuButton
              title="Sonnenuntergang"
              icon={<WeatherSunsetDown />}
              backgroundGradient="Orange, Red"
              value="sonnenuntergang"
            />
          </ButtonGroup>
          {
            <Collapse in={kanal === "wetter"}>
              <Wetter />
            </Collapse>
          }
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Licht);
