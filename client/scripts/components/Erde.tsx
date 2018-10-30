import * as React from "react";
import { StyleRulesCallback, withStyles } from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import * as GoogleMapsLoader from "google-maps";
import { delay } from "../utils";

export interface Props {}

export interface State {}

type ComponentClassNames = "root" | "map" | "pano";

const styles: StyleRulesCallback<ComponentClassNames> = () => ({
  root: {},
  map: {
    position: "absolute",
    left: "0px",
    width: "250px",
    top: "80px",
    height: "250px",
    zIndex: 9
  },

  pano: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "0",
    top: "0"
  }
});

class BildHintergrund extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  private map: any;
  private panorama: google.maps.StreetViewPanorama;
  private sv: google.maps.StreetViewService;
  private center: any;
  private rotating: any;
  private marker: any;
  private google: GoogleMapsLoader.google;

  constructor(props: any) {
    super(props);

    this.state = {};
  }

  public componentDidMount() {
    (GoogleMapsLoader as any).KEY = "AIzaSyCCEsIm_EoOS89xEPJVO5LnmXCulyccpsM";
    GoogleMapsLoader.load(google => {
      this.google = google;
      this.initMap();
    });
  }

  public initMap() {
    this.center = new this.google.maps.LatLng(
      Math.random() * 180 - 90,
      Math.random() * 360 - 180
    );
    this.sv = new google.maps.StreetViewService();

    this.panorama = new this.google.maps.StreetViewPanorama(
      this.refs.pano as any,
      {
        fullscreenControl: false,
        zoomControl: false,
        panControl: true,

        scrollwheel: false,
        disableDefaultUI: true,
        clickToGo: false,
        addressControl: true
      }
    );

    this.panorama.registerPanoProvider(() => {
      return null as any;
    });

    // Set up the map.
    this.map = new this.google.maps.Map(this.refs.map as any, {
      center: this.center,
      zoom: 5,
      streetViewControl: false,
      mapTypeId: this.google.maps.MapTypeId.HYBRID,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false
    });

    // Set the initial Street View camera to the center of the map
    this.sv.getPanorama(
      {
        location: this.center,
        radius: 500
      },
      this.processSVData
    );
  }

  public generateRandomPoint() {
    this.center = new this.google.maps.LatLng(
      Math.random() * 180 - 90,
      Math.random() * 360 - 180
    );

    this.sv.getPanoramaByLocation(this.center, 500, this.processSVData);
  }

  public processSVData = async (data: any, status: any) => {
    if (status === this.google.maps.StreetViewStatus.OK) {
      this.map.setCenter(data.location.latLng);

      if (this.marker) this.marker.setMap(null);

      this.marker = new this.google.maps.Marker({
        position: data.location.latLng,
        map: this.map,
        title: data.location.description
      });

      this.panorama.setPano(data.location.pano);
      this.panorama.setPov({
        heading: 270,
        pitch: 0
      });
      this.panorama.setVisible(true);

      setTimeout(() => {
        this.generateRandomPoint();
      }, 50000);

      clearInterval(this.rotating);
      await delay(1000);
      this.rotating = setInterval(() => {
        let pov = this.panorama.getPov();
        if (pov) (pov as any).heading += 0.12;

        this.panorama.setPov(pov);
      }, 10);
    } else {
      await delay(50);
      this.generateRandomPoint();
    }
  }

  public render() {
    const { classes } = this.props;
    const {} = this.state;

    return (
      <div>
        <div className={this.props.classes.pano} ref="pano" />
        <div className={classes.map} ref="map" />
      </div>
    );
  }
}

export default withStyles(styles)(BildHintergrund);
