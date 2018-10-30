import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  Earth,
  ImageFilterHdr,
  Star,
  Windows,
  Calendar
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { postJson, getJson, delay } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  ort?: "schweiz" | "erde" | "weltraum";
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
        "linear-gradient(to left bottom, rgba(173, 255, 47, 0.8), rgba(34, 139, 34, 0.2))",
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

class Aussenansicht extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  public async componentDidMount() {
    const data = await getJson("/api/kanal/ansehen");
    this.setState(data);
  }

  public handleChange = async (_event: any, ort: any) => {
    this.setState({ ort });
    await delay(0);
    postJson("api/kanal/ansehen", this.state);
    PubSub.publish("ansehenStateChange", this.state);
  }

  public render() {
    const { classes } = this.props;
    const { ort } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={ort}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Schweiz"
            icon={<ImageFilterHdr />}
            backgroundGradient="#FF0000, #AB2720"
            value="schweiz"
          />
          <MenuButton
            title="Erde"
            icon={<Earth />}
            backgroundGradient="SkyBlue, SeaGreen"
            value="erde"
          />
          <MenuButton
            title="Weltraum"
            icon={<Star />}
            backgroundGradient="DarkBlue, Black"
            value="weltraum"
          />
          <MenuButton
            title="Spotlight"
            icon={<Windows />}
            backgroundGradient="SkyBlue, Blue"
            value="spotlight"
          />
          <MenuButton
            title="Ereignisse"
            icon={<Calendar />}
            backgroundGradient="DarkRed, DarkSlateGray"
            value="erreignisse"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Aussenansicht);
