import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import {
  EmoticonTongue,
  EmoticonPoop,
  EmoticonNeutral,
  EmoticonHappy,
  Emoticon,
  EmoticonDevil,
  EmoticonExcited,
  EmoticonCool
} from "mdi-material-ui";
import ButtonGroup from "./ButtonGroup";
import { postJson, getJson, delay } from "../utils";
import MenuButton from "./MenuButton";

export interface Props {}

export interface State {
  stil?: "modern" | "klassisch";
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

class Musik extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  public async componentDidMount() {
    const data = await getJson("/api/kanal/musik");
    this.setState(data);
  }

  public handleChange = async (
    _event: React.ChangeEvent<{ checked: boolean }>,
    stil: any
  ) => {
    this.setState({ stil });

    await delay(0);
    postJson("api/kanal/musik", this.state);
  }

  public render() {
    const { classes } = this.props;
    const { stil } = this.state;

    return (
      <div className={classes.root}>
        <ButtonGroup
          value={stil}
          onChange={this.handleChange}
          selection="exclusive"
        >
          <MenuButton
            title="Interesse"
            icon={<EmoticonHappy />}
            backgroundImage="/img/musik/Interesse.jpg"
            value="interesse"
            style={{ marginLeft: "21%" }}
          />
          <MenuButton
            title="Gelassenheit"
            icon={<EmoticonNeutral />}
            backgroundImage="/img/musik/Gelassenheit.jpg"
            value="gelassenheit"
          />
          <MenuButton
            title="Akzeptanz"
            icon={<EmoticonTongue />}
            backgroundImage="/img/musik/Akzeptanz.jpg"
            value="akzeptanz"
          />
        </ButtonGroup>
        <ButtonGroup
          value={stil}
          onChange={this.handleChange}
          selection="exclusive"
          style={{ marginTop: "1%" }}
        >
          <MenuButton
            title="Groll"
            icon={<EmoticonPoop />}
            backgroundImage="/img/musik/Groll.jpg"
            value="groll"
          />
          <MenuButton
            title="Erwartung"
            icon={<Emoticon />}
            backgroundImage="/img/musik/Erwartung.png"
            value="erwartung"
          />
          <MenuButton
            title="Freude"
            icon={<EmoticonExcited />}
            backgroundImage="/img/musik/Freude.png"
            value="freude"
          />
        </ButtonGroup>
        <ButtonGroup
          value={stil}
          onChange={this.handleChange}
          selection="exclusive"
          style={{
            marginTop: "1%"
          }}
        >
          <MenuButton
            title="Wut"
            icon={<EmoticonDevil />}
            backgroundImage="/img/musik/Wut.png"
            value="wut"
          />
          <MenuButton
            title="Umsicht"
            icon={<EmoticonCool />}
            backgroundImage="/img/musik/Umsicht.jpg"
            value="umsicht"
          />
        </ButtonGroup>
      </div>
    );
  }
}

export default withStyles(style)(Musik);
