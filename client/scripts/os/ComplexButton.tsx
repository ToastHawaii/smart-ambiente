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
  StyleRulesCallback,
  Theme,
  withStyles,
  Typography,
  ButtonBase
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import * as classNames from "classnames";

interface Props {
  icon: JSX.Element;
  title: string;
  background: string;
  value?: any;
  onChange?: (
    event: React.ChangeEvent<{ checked: boolean }>,
    value: any,
    selected: boolean
  ) => void;
  onClick?: React.EventHandler<any>;
  selected?: boolean;
  toggle?: boolean;
  textColor?: string;
  style?: Partial<React.CSSProperties>;
  label?: string;
  labelColor?: string;
}
interface State {
  active: boolean;
}

type ComponentClassNames =
  | "root"
  | "image"
  | "imageButton"
  | "imageSrc"
  | "imageBackdrop"
  | "imageTitle"
  | "imageMarked"
  | "label"
  | "labelBackground"
  | "labelText";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = (
  theme: any
) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    minWidth: 200,
    width: "100%",
    borderRadius: "4px",
    [theme.breakpoints.down("xs")]: {
      minWidth: 0
    }
  },
  image: {
    position: "relative",
    height: 110,
    width: "100%",
    transition: theme.transitions.create("transform"),
    [theme.breakpoints.down("xs")]: {
      height: 55
    },
    "&.selected": {
      [theme.breakpoints.down("xs")]: {
        border: "2px solid white"
      }
    },
    "&.selected, &:hover, &.focus": {
      zIndex: 1,
      transform: "scale(1.08)",
      [theme.breakpoints.down("xs")]: {
        transform: "scale(1.05)"
      }
    },
    "&:hover $imageBackdrop": {
      opacity: 0.15
    },
    "&.selected $imageBackdrop, &:active $imageBackdrop": {
      opacity: 0
    },
    "&.focus": {
      boxShadow: "0 0 8px 4px white"
    },
    "&.selected $imageMarked, &.focus $imageMarked, &:hover $imageMarked": {
      opacity: 0
    },
    "&.selected $imageTitle, &:active $imageTitle": {
      border: "4px solid currentColor",
      background: "rgba(0, 0, 0, 0.1)",
      [theme.breakpoints.down("xs")]: {
        border: 0,
        background: "none"
      }
    },
    borderRadius: "4px"
  },
  imageButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
    borderRadius: "4px"
  },
  imageSrc: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "4px"
  },
  imageBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.3,
    transition: theme.transitions.create("opacity"),
    borderRadius: "4px"
  },
  imageTitle: {
    position: "relative",
    padding: `${theme.spacing.unit + 4}px ${theme.spacing.unit * 2}px ${theme
      .spacing.unit + 4}px`,
    minWidth: 58,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "96%",
    [theme.breakpoints.down("xs")]: {
      padding: 0,
      fontSize: "0.6rem",
      minWidth: 0
    }
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    bottom: -2,
    transition: theme.transitions.create("opacity"),
    borderRadius: "4px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    [theme.breakpoints.down("xs")]: {
      height: 2
    }
  },
  label: {
    display: "block",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    position: "absolute",
    backgroundColor: "tranparent",
    borderTopRightRadius: "4px",
    overflow: "hidden"
  },
  labelBackground: {
    display: "block",
    width: 0,
    height: 0,
    borderTop: "30px solid #ffcc00",
    borderBottom: "30px solid transparent",
    borderLeft: "30px solid transparent"
  },
  labelText: {
    position: "absolute",
    top: 1,
    width: "50%",
    right: "0",
    textAlign: "center",
    color: "#FFFFFF",
    display: "block"
  }
});

class ComplexButton extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      active: props.selected
    };
  }

  public handleChange = (event: any) => {
    let active = this.state.active;

    if (active === undefined)
      active = !!this.props.toggle && !this.props.selected;
    else active = !!this.props.toggle && !this.state.active;

    this.setState({ active: active });

    const { onChange, value, onClick } = this.props;

    if (onChange) {
      onChange(event, value, active);
    }

    if (onClick) {
      onClick(event);
    }
    event.stopPropagation();
  };

  public render() {
    const {
      classes,
      icon,
      title,
      background,
      selected,
      toggle,
      style: styleProp,
      textColor,
      label,
      labelColor
    } = this.props;

    let style: any = {};

    if (textColor !== "secondary" && textColor !== "inherit") {
      style.color = textColor;
    }

    style =
      Object.keys(style).length > 0
        ? {
            ...style,
            ...styleProp
          }
        : styleProp;

    return (
      <ButtonBase
        focusRipple
        key={title}
        className={classNames(
          classes.image,
          (toggle && this.state.active) || selected ? "selected" : ""
        )}
        style={style}
        onClick={this.handleChange}
      >
        <span
          className={classes.imageSrc}
          style={{
            backgroundImage: background
          }}
        />
        <span className={classes.imageBackdrop} />
        <span className={classes.imageButton}>
          <Typography
            component="span"
            variant="subtitle1"
            color="inherit"
            className={classes.imageTitle}
          >
            {icon}
            <br />
            {title}
            <span className={classes.imageMarked} />
          </Typography>
        </span>
        {label ? (
          <span className={classes.label}>
            <span
              className={classes.labelBackground}
              style={{ borderTopColor: labelColor ? labelColor : "" }}
            >
              <span className={classes.labelText}>{label}</span>
            </span>
          </span>
        ) : (
          ""
        )}
      </ButtonBase>
    );
  }
}

export default withStyles(style)(ComplexButton);
