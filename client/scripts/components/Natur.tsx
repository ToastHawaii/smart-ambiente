import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  WeatherSunny,
  Beach,
  Blackberry,
  Brightness5,
  NotificationClearAll
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  szene?: "wasserfall" | "strand" | "savanne" | "aquarium" | "sonne";
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
        "linear-gradient(to left bottom, rgba(205, 133, 63, 0.8), rgba(0, 128, 0, 0.2))",
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

class Aussenansicht extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("kanal/natur");
  }

  public handleChange = (_event: any, szene: any) => {
    this.publish("kanal/natur", { szene });
  }

  public render() {
    const { classes } = this.props;
    const { szene } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={szene}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Wasserfall"
            icon={<NotificationClearAll />}
            backgroundImage="/img/Wasserfall.jpg"
            value="wasserfall"
          />
          <MenuButton
            title="Strand"
            icon={<Beach />}
            backgroundImage="/img/Strand.jpg"
            value="strand"
          />
          <MenuButton
            title="Savanne"
            icon={<Brightness5 />}
            backgroundImage="/img/Savanne.jpg"
            value="savanne"
          />
          <MenuButton
            title="Aquarium"
            icon={<Blackberry />}
            backgroundImage="/img/Aquarium.jpg"
            value="aquarium"
          />
          <MenuButton
            title="Sonne"
            icon={<WeatherSunny />}
            backgroundImage="/img/Sonne.jpg"
            value="sonne"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Aussenansicht);
