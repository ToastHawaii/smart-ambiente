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
import {
  CircleOutline,
  CurrentAc,
  PencilPlus,
  ProgressWrench,
  Gift,
  Forum,
  EmoticonHappy,
  AccountGroup,
  Charity,
  ScaleBalance,
  Balloon,
  Nature
} from "mdi-material-ui";
import { StyleRulesCallback, withStyles, Typography, Theme } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { TileEvent, repository } from "./Repository";
import { getRandomInt } from "../../utils";

export interface Props {
  val: TileEvent;
}

export interface State {
  details: boolean;
  switch: boolean;
  hintergrundPosition: string;
  time: number;
  val: TileEvent;
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class EventTile extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  public constructor(props: any) {
    super(props);

    this.state = {
      details: false,
      switch: false,
      hintergrundPosition: "top left",
      time: 0,
      val: props.val
    };
  }

  public componentWillUnmount() {
    // use timeoutId from the state to clear the interval
    clearTimeout(this.timeoutId);
  }

  private counter: number = 0;
  private timeoutId: any;

  public timer() {
    const time =
      getRandomInt(1, 2) *
      (this.state.val.groesse === 1 || !!this.state.details ? 10000 : 20000);

    let hintergrundPosition: string;

    if (this.counter % 4 === 0) {
      hintergrundPosition = "center center";
    } else if (this.counter % 4 === 1) {
      hintergrundPosition = "center center";
    } else if (this.counter % 4 === 2) {
      hintergrundPosition = "bottom right";
    } else {
      hintergrundPosition = "top left";
    }

    this.timeoutId = setTimeout(() => {
      this.timer();
    }, time);

    this.counter++;
    if (this.counter % 3 === 0 && getRandomInt(1, 2) === 1) {
      this.setState({
        switch: true
      });
      setTimeout(() => {
        const newValue = repository.switch(this.state.val);
        this.setState({
          switch: false,
          val: newValue,
          details: false
        });
        this.counter = 0;
      }, 500);
    } else {
      this.setState({
        details: !this.state.details,
        hintergrundPosition: hintergrundPosition,
        time: time
      });
    }
  }

  public componentDidMount() {
    const time = getRandomInt(1, 2) * 10000;
    this.timeoutId = setTimeout(() => {
      this.timer();
    }, time);
  }

  public render() {
    const {
      groesse,
      hatDetails,
      titel,
      beschreibung,
      hintergrundFarbe: hintergrundFarbeBase,
      textFarbe,
      datum,
      zeit,
      ort,
      quelle,
      kategorie,
      icon,
      bild
    } = this.state.val;
    const { details, hintergrundPosition, time } = this.state;
    let i: any;

    let hintergrundFarbe = hintergrundFarbeBase;

    switch (icon) {
      case "Leichtigkeit":
        i = <Balloon />;
        hintergrundFarbe = "#336D19";
        break;
      case "Balance":
        i = <Nature />;
        hintergrundFarbe = "#39A535";
        break;
      case "Gerechtigkeit":
        i = <ScaleBalance />;
        hintergrundFarbe = "#46C6AF";
        break;
      case "Unterstützung":
        i = <Charity />;
        hintergrundFarbe = "#F69804";
        break;
      case "Dazugehören":
        i = <AccountGroup />;
        hintergrundFarbe = "#A77193";
        break;
      case "Wertschätzung":
        i = <EmoticonHappy />;
        hintergrundFarbe = "#508AB8";
        break;
      case "Austausch":
        i = <Forum />;
        hintergrundFarbe = "#21B5CF";
        break;
      case "Beitragen":
        i = <Gift />;
        hintergrundFarbe = "#CF1F50";
        break;
      case "Entwicklung":
        i = <ProgressWrench />;
        hintergrundFarbe = "#755390";
        break;
      case "Wirksam sein":
        i = <PencilPlus />;
        hintergrundFarbe = "#C3613E";
        break;
      case "Abwechslung":
        i = <CurrentAc />;
        hintergrundFarbe = "#EBB5C3";
        break;
      case "Schönheit":
        i = <CircleOutline />;
        hintergrundFarbe = "#BED062";
        break;
    }

    return (
      <div
        style={{
          float: "left",
          margin: "5px",
          width: groesse === 1 ? "180px" : "370px",
          height: "180px",
          overflow: "hidden",
          boxSizing: "border-box",
          transform: "rotateX(" + (this.state.switch ? "90deg" : "0") + ")",
          transition: "transform 0.5s ease-in"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: hintergrundFarbe,
            color: textFarbe,
            padding: "10px",
            position: "relative",
            display: "table",
            boxSizing: "border-box",
            transform:
              "translateY(" + (details && hatDetails ? "-180px" : "0") + ")",
            transition: "transform 1s"
          }}
        >
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(25% - 5px)",
              left: "5px",
              top: "5px",
              position: "absolute"
            }}
          >
            {i}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(75% - 5px)",
              right: "5px",
              top: "5px",
              position: "absolute",
              textAlign: "right"
            }}
          >
            {kategorie}
          </Typography>

          <Typography
            component="span"
            variant="subtitle1"
            color="inherit"
            style={{
              verticalAlign: "middle",
              display: "table-cell",
              textAlign: "center",
              paddingTop: "10px",
              paddingBottom: "10px"
            }}
          >
            {titel}
          </Typography>

          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {datum}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              right: "5px",
              textAlign: "right",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {ort}
          </Typography>
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            color: textFarbe,
            padding: "10px",
            position: "relative",
            display: "table",
            boxSizing: "border-box",
            transform:
              "translateY(" + (details && hatDetails ? "-180px" : "0") + ")",
            transition: "transform 1s"
          }}
        >
          <div
            style={{
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
              backgroundImage: "url('" + bild + "')",
              backgroundColor: hintergrundFarbe,
              backgroundSize: "cover",
              position: "absolute",
              opacity: bild ? 0.75 : 1,
              zIndex: -1,
              transition: details
                ? "background-position " + time / 1000 + "s linear"
                : "background-position 1s linear 1s",
              backgroundPosition: hintergrundPosition
            }}
          />
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(100% - 10px)",
              left: "5px",
              top: "5px",
              position: "absolute"
            }}
          >
            {titel}
          </Typography>
          <Typography
            component="p"
            variant="body1"
            color="inherit"
            style={{
              verticalAlign: "middle",
              display: "table-cell",
              textAlign: "center",
              paddingTop: "10px",
              paddingBottom: "10px",
              msWordBreak: "break-all",
              wordBreak: "break-all",
              WebkitHyphens: "auto",
              MozHyphens: "auto",
              msHyphens: "auto",
              hyphens: "auto"
            }}
          >
            {beschreibung}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {zeit}
          </Typography>
          <Typography
            component="span"
            variant="body1"
            color="inherit"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(50% - 5px)",
              right: "5px",
              textAlign: "right",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {quelle}
          </Typography>
        </div>
      </div>
    );
  }
}

export default withStyles(style)(EventTile);
