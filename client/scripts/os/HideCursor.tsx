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
