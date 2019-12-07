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
