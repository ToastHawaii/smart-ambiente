import * as React from "react";

export interface Props {}

export interface State {
  cursor: boolean;
}

class NoneCursor extends React.Component<Props, State> {
  private timeout1: NodeJS.Timer | number | undefined = undefined;
  private timeout2: NodeJS.Timer | number | undefined = undefined;
  private interval: any;
  private lastContent: string;

  constructor(props: any) {
    super(props);
    this.state = {
      cursor: true
    };
    this.timeout1 = undefined;
    this.timeout2 = undefined;
  }

  public componentDidMount() {
    setTimeout(async () => {
      this.setState({ cursor: true });
      setTimeout(async () => {
        this.setState({ cursor: false });

        this.interval = setInterval(async () => {
          const currentContent = document.body.innerHTML;
          if (currentContent !== this.lastContent) {
            this.lastContent = currentContent;

            if (this.timeout1) clearTimeout(this.timeout1 as any);
            if (this.timeout2) clearTimeout(this.timeout2 as any);

            this.timeout1 = setTimeout(async () => {
              this.setState({ cursor: true });

              this.timeout2 = setTimeout(async () => {
                this.setState({ cursor: false });
              }, 1000);
            }, 1000);
          }
        }, 1000);
      }, 1000);
    }, 1000);
  }

  public componentWillUnmount() {
    setTimeout(async () => {
      setTimeout(async () => {
        clearInterval(this.interval);
      }, 1000);
    }, 1000);
  }

  public handleMouseMove = () => {
    if (this.timeout1) clearTimeout(this.timeout1 as any);
    if (this.timeout2) clearTimeout(this.timeout2 as any);

    this.timeout1 = setTimeout(async () => {
      this.setState({ cursor: true });

      this.timeout2 = setTimeout(async () => {
        this.setState({ cursor: false });
      }, 1000);
    }, 1000);
  };

  public render() {
    const { children } = this.props;
    const { cursor } = this.state;

    setTimeout(() => {
      this.lastContent = document.body.innerHTML;
    }, 0);

    return (
      <div
        onMouseMove={this.handleMouseMove}
        style={{ cursor: !cursor ? "none" : "" }}
      >
        {children}
      </div>
    );
  }
}

export default NoneCursor;
