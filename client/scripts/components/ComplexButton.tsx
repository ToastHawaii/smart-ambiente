import * as React from "react";
import {
  StyleRulesCallback,
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
  | "imageMarked";

const style: StyleRulesCallback<ComponentClassNames> = (theme: any) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    minWidth: 200,
    width: "100%",
    borderRadius: "10px"
  },
  image: {
    position: "relative",
    height: 130,
    width: "100%",
    transition: theme.transitions.create("box-shadow"),
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100
    },
    "&.selected, &:hover": {
      zIndex: 1
    },
    "&:hover $imageBackdrop": {
      opacity: 0.15
    },
    "&.selected $imageBackdrop, &:active $imageBackdrop": {
      opacity: 0
    },
    "&.focus": {
      boxShadow: "0 0 4px 2px white"
    },
    "&.selected $imageMarked, &.focus $imageMarked, &:hover $imageMarked": {
      opacity: 0
    },
    "&.selected $imageTitle, &:active $imageTitle": {
      border: "4px solid currentColor",
      background: "rgba(0, 0, 0, 0.1)"
    },
    borderRadius: "10px"
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
    borderRadius: "10px"
  },
  imageSrc: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "10px"
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
    borderRadius: "10px"
  },
  imageTitle: {
    position: "relative",
    padding: `${theme.spacing.unit + 6}px ${theme.spacing.unit * 4}px ${theme
      .spacing.unit + 6}px`
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity")
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
  }

  public render() {
    const {
      classes,
      icon,
      title,
      background,
      selected,
      toggle,
      style: styleProp,
      textColor
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
            variant="subheading"
            color="inherit"
            className={classes.imageTitle}
          >
            {icon}
            <br />
            {title}
            <span className={classes.imageMarked} />
          </Typography>
        </span>
      </ButtonBase>
    );
  }
}

export default withStyles(style)(ComplexButton);
