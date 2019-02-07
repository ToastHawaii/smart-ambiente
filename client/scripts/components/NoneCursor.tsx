import * as React from "react";

export interface Props {}

export interface State {}

class NoneCursor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    const { children } = this.props;
    return <div style={{ cursor: "none" }}>{children}</div>;
  }
}

export default NoneCursor;
