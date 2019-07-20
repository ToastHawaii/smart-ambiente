import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import EventTile from "./Tile";
import { TileEvent, saisonRepository } from "./Repository";

export interface Props {}

export interface State {
  events: TileEvent[];
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {}
});

class Events extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  public constructor(props: any) {
    super(props);

    this.state = {
      events: []
    };
  }

  public async componentDidMount() {
    const events = await saisonRepository.get();
    this.setState({
      events: events
    });
  }

  public render() {
    const {} = this.props;
    const { events } = this.state;
    return (
      <div
        style={{
          padding: "15px 7px"
        }}
      >
        {events.map(e => (
          <EventTile val={e} />
        ))}
      </div>
    );
  }
}

export default withStyles(style)(Events);
