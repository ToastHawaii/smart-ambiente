import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { Earth, Airplane, Circle } from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { Component } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  reise?: "flug" | "umrundungErde" | "umrundungMond";
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
        "linear-gradient(to left bottom, rgba(0, 255, 255, 0.8), rgba(0, 0, 139, 0.2))",
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
    this.subscribe("kanal/tour");
  }

  public handleChange = (_event: any, reise: any) => {
    this.publish("kanal/tour", { reise });
  }

  public render() {
    const { classes } = this.props;
    const { reise } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={reise}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Flug"
            icon={<Airplane />}
            backgroundImage="/img/Flug.jpg"
            value="flug"
          />
          <MenuButton
            title="Erdumrundung"
            icon={<Earth />}
            backgroundImage="/img/Erdumrundung.jpg"
            value="umrundungErde"
          />
          <MenuButton
            title="Mondumrundung"
            icon={<Circle />}
            backgroundImage="/img/Mondumrundung.jpg"
            value="umrundungMond"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Aussenansicht);
