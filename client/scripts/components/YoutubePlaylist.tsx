import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { getJson } from "../utils";

export interface Props {
  list: string;
  first: number;
}

export interface State {
  muted?: boolean;
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {
    marginTop: "1%"
  }
});

class YoutubeVideo extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    getJson("/api/sinn/ton").then((data: any) => {
      this.setState({ muted: data.lautstaerke !== "bild" });
    });

    PubSub.subscribe("tonStateChange", (_message: any, data: any) => {
      this.setState({ muted: data.lautstaerke !== "bild" });
    });
  }

  public render() {
    const { list, first } = this.props;
    const { muted } = this.state;
    const attr = {
      frameBorder: "0",
      allow: "autoplay; encrypted-media"
    };
    return (
      <iframe
        style={{
          width: "100%",
          position: "absolute",
          top: "0",
          height: "100%",
          background: "black",
          border: "0"
        }}
        src={
          "https://www.youtube-nocookie.com/embed/?list=" +
          list +
          "&index=" +
          first +
          "&rel=0&controls=0&showinfo=0&autoplay=1&mute=" +
          (muted ? 1 : 0) +
          "&cc_load_policy=" +
          (muted ? 1 : 0)
        }
        {...attr}
        allowFullScreen
      />
    );
  }
}

export default withStyles(style)(YoutubeVideo);
