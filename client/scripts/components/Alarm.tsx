import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  ThemeLightDark,
  WeatherNight,
  WeatherSunny,
  KeyboardOutline,
  GamepadVariant
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "./Component";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  zeit?: "05:56" | "06:56" | "07:56";
  tage?: "1-5" | "0-6";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class Alarm extends Component<Props & WithStyles<ComponentClassNames>, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/alarm");
  }

  public handleZeitChange = (_event: any, zeit: any) => {
    this.publish("kanal/alarm", { zeit });
  }
  public handleTageChange = (_event: any, tage: any) => {
    this.publish("kanal/alarm", { tage });
  }

  public render() {
    const { classes } = this.props;
    const { zeit, tage } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={zeit}
          onChange={this.handleZeitChange}
          selection="exclusive"
        >
          <MenuButton
            icon={<WeatherNight />}
            title="06:30"
            selected={zeit === "05:56"}
            backgroundGradient="Blue, MidnightBlue"
            value="05:56"
          />
          <MenuButton
            icon={<ThemeLightDark />}
            title="07:30"
            selected={zeit === "06:56"}
            backgroundGradient="Orange, Red"
            value="06:56"
          />
          <MenuButton
            icon={<WeatherSunny />}
            title="08:30"
            selected={zeit === "07:56"}
            backgroundGradient="Yellow, Orange"
            value="07:56"
          />
        </ButtonGroup>
        <ButtonGroup
          value={tage}
          onChange={this.handleTageChange}
          selection="exclusive"
          style={{
            marginTop: "1%"
          }}
        >
          <MenuButton
            icon={<KeyboardOutline />}
            title="Mo bis Fr"
            selected={tage === "1-5"}
            backgroundGradient="LightBlue, DarkBlue"
            value="1-5"
          />
          <MenuButton
            icon={<GamepadVariant />}
            title="Mo bis So"
            selected={tage === "0-6"}
            backgroundGradient="LimeGreen, DarkGreen"
            value="0-6"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Alarm);