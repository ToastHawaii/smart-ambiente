import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { Component } from "./Component";

export interface Props {
  src: string;
}

export interface State {}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {
    marginTop: "1%"
  }
});

class LoopVideo extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
        <video
          autoPlay
          muted
          loop
          style={{
            width: "100%",
            position: "absolute",
            height: "100%",
            right: "0",
            objectFit: "cover"
          }}
        >
          <source src={this.props.src + ".webm"} type="video/webm" />
        </video>
    );
  }
}
export default withStyles(style)(LoopVideo);
