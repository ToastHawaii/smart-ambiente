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
  Sprout,
  Mushroom,
  Spa,
  Carrot,
  Barley,
  FoodApple,
  ScatterPlot
} from "mdi-material-ui";
import {
  StyleRulesCallback,
  withStyles,
  Typography,
  Theme
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { TileSaison, repository } from "./Repository";
import { getRandomInt } from "../../utils";

export interface Props {
  val: TileSaison;
}

export interface State {
  details: boolean;
  switch: boolean;
  time: number;
  val: TileSaison;
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class SaisonTile extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  public constructor(props: any) {
    super(props);

    this.state = {
      details: false,
      switch: false,
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
      hintergrundFarbe,
      textFarbe,
      datum,
      icon,
      bild
    } = this.state.val;
    const { details } = this.state;
    let i: any;
    switch (icon) {
      case "Apfel":
        i = <FoodApple />;
        break;
      case "Beere":
        i = <ScatterPlot />;
        break;
      case "Frucht":
        i = <FoodApple />;
        break;
      case "Gemüse":
        i = <Carrot />;
        break;
      case "Kartoffel":
        i = <Sprout />;
        break;
      case "Kraut/Blüte":
        i = <Barley />;
        break;
      case "Pilz":
        i = <Mushroom />;
        break;
      case "Salat":
        i = <Spa />;
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
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
              position: "absolute",
              opacity: bild ? 0.75 : 1,
              zIndex: -1
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
              left: "5px",
              top: "5px",
              position: "absolute"
            }}
          >
            {i}
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
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {datum}
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
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
              position: "absolute",
              opacity: bild ? 0.75 : 1,
              zIndex: -1
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
              left: "5px",
              bottom: "5px",
              position: "absolute"
            }}
          >
            {datum}
          </Typography>
        </div>
      </div>
    );
  }
}

export default withStyles(style)(SaisonTile);
