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
import SaisonTile from "./Tile";
import { TileSaison, repository } from "./Repository";

export interface Props {}

export interface State {
  saisons: TileSaison[];
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class Saisons extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  public constructor(props: any) {
    super(props);

    this.state = {
      saisons: []
    };
  }

  public async componentDidMount() {
    const saisons = await repository.get();
    this.setState({
      saisons: saisons
    });
  }

  public render() {
    const {} = this.props;
    const { saisons } = this.state;
    return (
      <div
        style={{
          padding: "15px 7px"
        }}
      >
        {saisons.map(e => (
          <SaisonTile val={e} />
        ))}
      </div>
    );
  }
}

export default withStyles(style)(Saisons);
