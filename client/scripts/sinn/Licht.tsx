import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  Lightbulb,
  LightbulbOutline,
  ThemeLightDark,
  LightbulbOn,
  WeatherSunsetUp,
  WeatherSunsetDown,
  BatteryCharging,
  BookOpenPageVariant
} from "mdi-material-ui";
import Wetter from "../kanal/Wetter";
import ButtonGroup from "../os/ButtonGroup";
import { Component } from "../os/Component";
import MenuButton from "../os/MenuButton";

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
  }

  public handleKanalChange = (_event: any, kanal: any) => {
    this.publish("sinn/licht", { kanal });
  }

  public render() {
    const { classes } = this.props;
    const { helligkeit, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={helligkeit}
          onChange={this.handleHelligkeitChange}
          selection="exclusive"
          style={{ paddingTop: "1%" }}
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
              title="Entspannen"
              icon={<BookOpenPageVariant />}
              backgroundGradient="#fef8a8, #ffbc61"
              value="entspannen"
            />
            <MenuButton
              title="Aktivieren"
              icon={<BatteryCharging />}
              backgroundGradient="#cdf9fe, #9bcee1"
              value="aktivieren"
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
