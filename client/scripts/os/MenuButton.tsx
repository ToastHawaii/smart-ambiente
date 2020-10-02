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
import ComplexButton from "./ComplexButton";

interface Props {
  icon: JSX.Element;
  title: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  value?: any;
  onChange?: (
    event: React.ChangeEvent<{ checked: boolean }>,
    value: any,
    selected: boolean
  ) => void;
  onClick?: React.EventHandler<any>;
  selected?: boolean;
  toggle?: boolean;
  style?: Partial<React.CSSProperties>;
  label?: string;
  labelColor?: string;
}
interface State {}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class MenuButton extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    const {
      icon,
      title,
      value,
      backgroundImage,
      backgroundGradient,
      onChange,
      onClick,
      selected,
      style,
      toggle,
      label,
      labelColor
    } = this.props;

    let background: string;
    if (backgroundGradient)
      background = "linear-gradient(to top right, " + backgroundGradient + ")";
    else background = "url('" + backgroundImage + "')";

    return (
      <ComplexButton
        title={title}
        icon={icon}
        background={background}
        value={value}
        style={{
          width: "14.666%",
          margin: "0 1%",
          ...style
        }}
        onChange={onChange}
        onClick={onClick}
        selected={selected}
        toggle={toggle}
        label={label}
        labelColor={labelColor}
      />
    );
  }
}

export default withStyles(style)(MenuButton);
