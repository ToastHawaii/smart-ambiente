import * as React from "react";
import { StyleRulesCallback, withStyles, Theme } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import { delay, getRandomInt } from "../utils";

export interface Props {}

export interface State {
  kamera?: string;
}

type ComponentClassNames = "root";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {}
});

class Schweiz extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  public constructor(props: any) {
    super(props);
    this.state = {};
  }

  private running: boolean;

  public componentDidMount() {
    this.running = true;
    this.nextCam();
  }
  public componentWillUnmount() {
    this.running = false;
  }

  private async nextCam() {
    if (!this.running) return;

    const kameras = [
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4001&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4002&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4003&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4004&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4005&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4006&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4007&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4008&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4009&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4010&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4011&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4025&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4026&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4027&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4045&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4076&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4077&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4080&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4085&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4086&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4090&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4091&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4095&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4100&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4106&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4107&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4115&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4116&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4120&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4145&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4155&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4160&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4165&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4166&lg=de&getLatest=1&c1=0&flc=1"
      },
      //{ duration: 10, init: 1, source: "https://webtv.feratel.com/webtv/?design=v3&cam=4170&lg=de&getLatest=1&c1=0&flc=1" },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4172&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4175&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4180&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4181&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4210&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4211&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4212&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4215&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4220&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4225&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4226&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4230&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4231&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4235&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4240&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4251&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4260&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4270&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=4271&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=24003&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=24096&lg=de&getLatest=1&c1=0&flc=1"
      },
      {
        duration: 53,
        init: 3,
        source:
          "https://webtv.feratel.com/webtv/?design=v3&cam=34003&lg=de&getLatest=1&c1=0&flc=1"
      },
      //{ duration: 53, init: 3, source: "https://webtv.feratel.com/webtv/?design=v3&cam=34170&lg=de&getLatest=1&c1=0&flc=1" },
      //{ duration: 10, init: 1, source: "https://webtv.feratel.com/webtv/?design=v3&cam=34171&lg=de&getLatest=1&c1=0&flc=1" },
      //{ duration: 10, init: 1, source: "https://webtv.feratel.com/webtv/?design=v3&cam=34172&lg=de&getLatest=1&c1=0&flc=1" },
      //{ duration: 10, init: 1, source: "https://webtv.feratel.com/webtv/?design=v3&cam=34173&lg=de&getLatest=1&c1=0&flc=1" },
      //{ duration: 10, init: 1, source: "https://webtv.feratel.com/webtv/?design=v3&cam=34175&lg=de&getLatest=1&c1=0&flc=1" },
      //{ duration: 10, init: 1, source: "https://webtv.feratel.com/webtv/?design=v3&cam=34176&lg=de&getLatest=1&c1=0&flc=1" },
      //{ duration: 10, init: 1, source: "http://oekihof.infostzg.ch/eingang.jpg" },
      //{ duration: 10, init: 1, source: "http://oekihof.infostzg.ch/annahme.jpg" },
      //{ duration: 30, init: 1, source: "http://fgz.redics.ch/live.cgi?ch=0&i=" + ((new Date().getTime() / 1000 | 0) + 150) },
      {
        duration: 50,
        init: 1,
        source: "https://webcam.switch.ch/zuerich/archiv.de.php"
      },
      {
        duration: 160,
        init: 15,
        source: "https://kachelmannwetter.roundshot.com/tierparkgoldau/"
      },
      { duration: 50, init: 15, source: "https://uetliberg.roundshot.com/" },
      {
        duration: 160,
        init: 15,
        source: "https://winterthur.roundshot.com/altstadt/"
      },
      {
        duration: 160,
        init: 15,
        source: "https://winterthur.roundshot.com/roterturm/"
      },
      { duration: 160, init: 15, source: "https://nzz.roundshot.com/" },
      {
        duration: 160,
        init: 15,
        source: "https://zuerichtourismus.roundshot.com/stadthaus/"
      },
      {
        duration: 160,
        init: 15,
        source: "https://zuerichtourismus.roundshot.com/zuerichwest/"
      },
      { duration: 160, init: 15, source: "https://laf.roundshot.com/" },
      {
        duration: 160,
        init: 15,
        source: "https://latourdepeilz.roundshot.com/"
      },
      { duration: 160, init: 15, source: "https://neuchatel.roundshot.com/" },
      { duration: 160, init: 15, source: "https://luks-sursee.roundshot.com/" },
      {
        duration: 160,
        init: 15,
        source: "https://avenches.roundshot.com/camping-plage/"
      },
      {
        duration: 160,
        init: 15,
        source: "https://flugplatzschupfart.roundshot.com/"
      },
      { duration: 120, init: 15, source: "https://sgv.roundshot.com/" },
      { duration: 80, init: 15, source: "https://morat.roundshot.com/" },
      { duration: 80, init: 15, source: "https://weggis.roundshot.com/" },
      {
        duration: 40,
        init: 15,
        source: "https://yverdon.roundshot.com/ville/"
      },
      {
        duration: 40,
        init: 15,
        source: "https://luzerntourismus.roundshot.com/"
      }
      //{ duration: 10, init: 1, source: "http://mdfcam.i-video.biz/webcam-weitwinkel.jpg" }
    ];

    const kamera = kameras[getRandomInt(0, kameras.length - 1)];

    this.setState({
      kamera: kamera.source
    });

    await delay(kamera.duration * 1000);
    this.nextCam();
  }

  public render() {
    const {} = this.props;
    const { kamera } = this.state;

    return (
      <iframe
        src={kamera}
        scrolling="no"
        style={{
          width:
            kamera && kamera.indexOf("roundshot") > -1
              ? "calc(100% + 60px)"
              : "100%",
          height: "100%",
          position: "absolute",
          top: "0",
          border: "none",
          background: "#eee",
          zIndex: 1
        }}
      />
    );
  }
}

export default withStyles(style)(Schweiz);
