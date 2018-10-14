import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";

interface Props {
  onChange?: (
    _event: React.ChangeEvent<{ checked: boolean }>,
    value: any
  ) => void;
  value?: any;
  selection?: "exclusive" | "multiple";
  style?: Partial<React.CSSProperties>;
}
interface State {}

type ComponentClassNames = "root";

const style: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {
    width: "100%"
  }
});

class ButtonGroup extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  public render() {
    const {
      children: childrenProp,
      onChange,
      value,
      style: styleProp
    } = this.props;

    let style: any = {};

    style =
      Object.keys(style).length > 0
        ? {
            ...style,
            ...styleProp
          }
        : styleProp;

    const children = React.Children.map<any>(childrenProp, child => {
      if (!React.isValidElement(child)) {
        return null;
      }

      if (this.props.selection === "multiple") {
        return React.cloneElement(child as any, {
          onChange: onChange || (child as any).props.onChange,
          toggle: true,
          selected: (child as any).props.selected,
          value: (child as any).props.value
        });
      } else {
        return React.cloneElement(child as any, {
          onChange: onChange || (child as any).props.onChange,
          selected: (child as any).props.value === value,
          value: (child as any).props.value
        });
      }
    });

    return <div style={style}>{children}</div>;
  }
}

export default withStyles(style)<Props>(ButtonGroup);
