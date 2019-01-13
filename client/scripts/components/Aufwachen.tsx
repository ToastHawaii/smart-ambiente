import * as React from "react";
import { StyleRulesCallback, withStyles, Collapse } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { LightbulbOutline, LightbulbOn } from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "./Component";
import MenuButton from "./MenuButton";
import Alarm from "./Alarm";

export interface Props {}

export interface State {
  aktiv?: "aus" | "an";
  kanal?: "alarm";
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class Aufwachen extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("sinn/aufwachen");
  }

  public handleAktivChange = (_event: any, aktiv: any) => {
    this.publish("sinn/aufwachen", { aktiv });
  }

  public render() {
    const { classes } = this.props;
    const { aktiv, kanal } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={aktiv}
          onChange={this.handleAktivChange}
          selection="exclusive"
        >
          <MenuButton
            title="Natürlich"
            icon={<LightbulbOutline />}
            backgroundGradient="lightgray, black"
            value="aus"
          />
          <MenuButton
            title="Unterstützt"
            icon={<LightbulbOn />}
            backgroundGradient="Red, LightYellow"
            value="an"
          />
        </ButtonGroup>
        <Collapse
          in={aktiv !== "aus"}
          style={{
            marginTop: "1%"
          }}
        >
          <Collapse in={kanal === "alarm"}>
            <Alarm />
          </Collapse>
        </Collapse>
      </div>
    );
  }
}

export default withStyles(style)(Aufwachen);
