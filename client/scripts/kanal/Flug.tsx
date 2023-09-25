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
import {
  StyleRulesCallback,
  withStyles,
  Typography,
  Theme,
} from "@material-ui/core";
import { WithStyles } from "@material-ui/core";
import * as GoogleMapsLoader from "google-maps";
import { setInterval } from "timers";
import { getJson, delay } from "../utils";
import Marquee from "react-smooth-marquee";

const minZoom = 20;

let loading = false;

export interface Props {}

export interface State {
  text: string;
  image: string;
  loaded: boolean;
}

type ComponentClassNames =
  | "root"
  | "map"
  | "mapSmall"
  | "text"
  | "image"
  | "loadingScreen";

const style: StyleRulesCallback<Theme, any, ComponentClassNames> = () => ({
  root: {},
  map: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "0",
    top: "0",
  },
  mapSmall: {
    position: "absolute",
    left: "0px",
    width: "250px",
    top: "80px",
    height: "250px",
    zIndex: 8,
  },
  text: {
    position: "absolute",
    left: "0",
    bottom: "0",
    right: "0",
    whiteSpace: "nowrap",
    padding: "10px",
    paddingLeft: "100vw",
    width: "10000000px",
    background: "rgba(255,255,255,0.8)",
  },
  image: {
    position: "absolute",
    right: "0px",
    width: "250px",
    top: "80px",
    zIndex: 8,
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
    zIndex: 9,
  },
});

class BildHintergrund extends React.Component<
  Props & WithStyles<ComponentClassNames>,
  State
> {
  private map: google.maps.Map;
  private mapSmall: google.maps.Map;
  private google: GoogleMapsLoader.google;
  private direction: number;
  private maxZoomService: google.maps.MaxZoomService;
  private marker: any;

  constructor(props: any) {
    super(props);

    this.state = {
      text: "",
      image: "",
      loaded: false,
    };
  }

  public async componentDidMount() {
    (GoogleMapsLoader as any).KEY = (await getJson("/api/config/flug")).key;
    GoogleMapsLoader.load((google) => {
      this.google = google;
      this.initMap();
    });
  }

  public initMap() {
    this.direction = Math.floor(Math.random() * 3);

    this.maxZoomService = new this.google.maps.MaxZoomService();

    const center = new this.google.maps.LatLng(
      //47.3807813, 8.4837658
      Math.random() * 180 - 90,
      Math.random() * 360 - 180
    );

    // Set up the map.
    this.map = new this.google.maps.Map(this.refs.map as any, {
      center: center,
      zoom: 18,
      streetViewControl: false,
      mapTypeId: this.google.maps.MapTypeId.SATELLITE,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false,
      heading: this.direction * 90,
      tilt: 45,
      rotateControl: false,
    });
    this.mapSmall = new this.google.maps.Map(this.refs.mapSmall as any, {
      center: center,
      zoom: 5,
      streetViewControl: false,
      mapTypeId: this.google.maps.MapTypeId.HYBRID,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false,
    });

    this.marker = new this.google.maps.Marker({
      position: this.mapSmall.getCenter(),
      map: this.mapSmall,
    });

    loading = true;
    this.maxZoomService.getMaxZoomAtLatLng(center, (response: any) => {
      if (!loading) return;
      else loading = false;

      if (response.status !== google.maps.MaxZoomStatus.OK)
        this.newRandomPosition();

      if (center === null) return;

      if (response.zoom >= minZoom) {
        this.startTour();
      } else this.newRandomPosition();
    });
  }

  private showInfo() {
    getJson(
      "https://de.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=1000&explaintext=&generator=geosearch&ggscoord=" +
        this.map.getCenter().lat() +
        "|" +
        this.map.getCenter().lng() +
        "&ggsradius=10000&ggslimit=1&exlimit=1&format=json&origin=*"
    ).then(
      (result: {
        batchcomplete: string;
        query: {
          pages: {
            [pageid: string]: {
              pageid: number;
              ns: number;
              title: string;
              index: number;
              extract: string;
              thumbnail: {
                source: string;
                width: number;
                height: number;
              };
            };
          };
        };
      }) => {
        if (result.query) {
          let article = result.query.pages[Object.keys(result.query.pages)[0]];
          if (article) {
            if (this.state.text !== article.extract) {
              this.setState({
                text: article.extract,
                image: article.thumbnail.source,
              });
            }
          } else {
            if (this.state.text !== "") {
              this.setState({ text: "", image: "" });
            }
          }
        } else {
          if (this.state.text !== "") {
            this.setState({ text: "", image: "" });
          }
        }
      }
    );
  }

  private startTour() {
    if (!this.state.loaded) this.setState({ loaded: true });

    let counter = 30 * (1000 / 25);

    const stepInterval = setInterval(() => {
      let center: google.maps.LatLng | null = null;
      if (this.direction === 0) {
        center = new this.google.maps.LatLng(
          this.map.getCenter().lat() + 0.00001,
          this.map.getCenter().lng()
        );
      } else if (this.direction === 1) {
        center = new this.google.maps.LatLng(
          this.map.getCenter().lat(),
          this.map.getCenter().lng() + 0.00001
        );
      } else if (this.direction === 2) {
        center = new this.google.maps.LatLng(
          this.map.getCenter().lat() - 0.00001,
          this.map.getCenter().lng()
        );
      } else if (this.direction === 3) {
        center = new this.google.maps.LatLng(
          this.map.getCenter().lat(),
          this.map.getCenter().lng() - 0.00001
        );
      }

      if (center === null) return;

      if (counter > 0) {
        this.map.panTo(center);
        counter--;
        return;
      }

      counter = 30 * (1000 / 25);

      loading = true;
      this.maxZoomService.getMaxZoomAtLatLng(center, (response: any) => {
        if (!loading) return;
        else loading = false;

        if (response.status !== google.maps.MaxZoomStatus.OK)
          this.newRandomPosition();

        if (center === null) return;

        if (response.zoom >= minZoom) {
          this.map.panTo(center);
        } else {
          clearInterval(stepInterval);
          clearInterval(infoInterval);
          this.newRandomPosition();
        }
      });
    }, 25);

    this.showInfo();
    this.marker.setMap(null);
    this.marker = new this.google.maps.Marker({
      position: this.mapSmall.getCenter(),
      map: this.mapSmall,
    });
    const infoInterval = setInterval(() => {
      this.mapSmall.setCenter(this.map.getCenter());

      this.marker.setMap(null);
      this.marker = new this.google.maps.Marker({
        position: this.mapSmall.getCenter(),
        map: this.mapSmall,
      });

      this.showInfo();
    }, 60000);
  }

  public async newRandomPosition() {
    await delay(100);
    let center = new this.google.maps.LatLng(
      Math.random() * 180 - 90,
      Math.random() * 360 - 180
    );

    loading = true;
    this.maxZoomService.getMaxZoomAtLatLng(center, (response: any) => {
      if (!loading) return;
      else loading = false;

      if (response.status !== google.maps.MaxZoomStatus.OK)
        this.newRandomPosition();

      if (response.zoom >= minZoom) {
        this.map.setCenter(center);
        this.mapSmall.setCenter(center);
        this.startTour();
      } else this.newRandomPosition();
    });
  }

  public render() {
    const { classes } = this.props;
    const { text, image, loaded } = this.state;

    let info: JSX.Element | null = null;
    if (text)
      info = (
        <div className={classes.text}>
          <Marquee velocity="0.08">
            <Typography>{text}</Typography>
          </Marquee>
        </div>
      );
    let pic: JSX.Element | null = null;
    if (image) pic = <img className={classes.image} src={image} />;

    return (
      <div>
        {!loaded ? <div className={classes.loadingScreen} /> : ""}
        <div className={classes.map} ref="map" />
        <div className={classes.mapSmall} ref="mapSmall" />
        {pic}
        {info}
      </div>
    );
  }
}

export default withStyles(style)(BildHintergrund);
