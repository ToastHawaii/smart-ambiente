import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { getJson } from "../utils";
import { CSSProperties } from "react";

export interface Props {
  video: string;
  startAt?: number;
  align?: "top" | "bottom";
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
    const { video, startAt, align } = this.props;
    const { muted } = this.state;
    const attr = {
      frameBorder: "0",
      allow: "autoplay; encrypted-media"
    };

    let iframeStyle: CSSProperties = {
      width: "100%",
      position: "absolute",
      height: "100%",
      background: "black",
      border: "0"
    };

    iframeStyle[align || "top"] = "0";

    return (
      <iframe
        style={iframeStyle}
        src={
          "https://www.youtube-nocookie.com/embed/" +
          video +
          "?rel=0&controls=0&showinfo=0&autoplay=1" +
          (startAt ? "&start=" + startAt : "") +
          "&mute=" +
          (muted ? 1 : 0)
        }
        {...attr}
        allowFullScreen
      />
    );
  }
}

export default withStyles(style)<Props>(YoutubeVideo);
