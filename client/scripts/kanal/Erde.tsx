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
import * as GoogleMapsLoader from "google-maps";
import { delay, getJson } from "../utils";

export interface Props {}

export interface State {
  loaded: boolean;
}

type ComponentClassNames = "root" | "map" | "pano" | "loadingScreen";

const styles: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {},
  map: {
    position: "absolute",
    left: "0px",
    width: "250px",
    top: "80px",
    height: "250px",
    zIndex: 8
  },

  pano: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "0",
    top: "0"
  },

  loadingScreen: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "0",
    top: "0",
    backgroundImage: "url('/img/earth.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 9
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

    this.state = {
      loaded: false
    };
  }

  private timeout: any;
  public async componentDidMount() {
    if (navigator.userAgent.indexOf("SMART-TV") !== -1) {
      this.timeout = setTimeout(() => {
        if (document.location) document.location.reload();
      }, 5 * 60 * 1000);
    }

    (GoogleMapsLoader as any).KEY = (await getJson("/api/config/erde")).key;
    GoogleMapsLoader.load(google => {
      this.google = google;
      this.initMap();
    });
  }

  public componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
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
      if (!this.state.loaded) this.setState({ loaded: true });

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
  };

  public render() {
    const { classes } = this.props;
    const { loaded } = this.state;

    return (
      <div>
        {!loaded ? <div className={classes.loadingScreen} /> : ""}
        <div className={this.props.classes.pano} ref="pano" />
        <div className={classes.map} ref="map" />
      </div>
    );
  }
}

export default withStyles(styles)(BildHintergrund);
