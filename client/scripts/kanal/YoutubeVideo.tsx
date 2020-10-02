// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

import * as React from "react";
import { StyleRulesCallback, withStyles, Theme } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { Component } from "../os/Component";
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

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {
    marginTop: "1%"
  }
});

class YoutubeVideo extends Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public componentDidMount() {
    this.subscribe("sinn/ton", data => ({
      muted: data.lautstaerke !== "bild"
    }));
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

export default withStyles(style)(YoutubeVideo);
