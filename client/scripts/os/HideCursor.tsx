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

export interface Props {}

export interface State {
  cursor: string;
}

class HideCursor extends React.Component<Props, State> {
  private timeout: NodeJS.Timer | number | undefined = undefined;
  constructor(props: any) {
    super(props);
    this.state = {
      cursor: ""
    };
    this.timeout = undefined;
  }

  public handleMouseMove = () => {
    this.setState({ cursor: "" });
    if (this.timeout) clearTimeout(this.timeout as any);

    this.timeout = setTimeout(() => {
      this.setState({ cursor: "none" });
    }, 2000);
  };

  public render() {
    const { children } = this.props;
    const { cursor } = this.state;

    return (
      <div onMouseMove={this.handleMouseMove} style={{ cursor: cursor }}>
        {children}
      </div>
    );
  }
}

export default HideCursor;
