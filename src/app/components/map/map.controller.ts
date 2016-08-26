import { TrailService, ITrackData, IEvent, ITrackMetaData, ILatLng } from '../trailService/trailService.service';

export class MapController {
  public defaults: any = {
    maxZoom: 19
  };
  public center: any = {};
  public markers: any = {};
  public layers: any = {
    baselayers: {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz'
      }
    },
    overlays: {}
  };
  public paths: any = {};
  public geoJson: any = {
    style: {
      fillColor: 'green',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    }
  };
  private icon = {
    iconUrl: 'assets/icon_ship.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  };

  /* @ngInject */
  constructor(public trailService: TrailService, private $scope: angular.IScope, public $state: angular.ui.IStateService) {
    this.$scope.$on('$destroy', () => this.trailService.unsubscribe(this));
    this.trailService.subscribe(this);
  }

  public updateEditor(mapFn: (MapController) => void) { // tslint:disable-line
    mapFn(this);
  }

  public update(first: boolean): void {
    if (first) {
      this.geoJson.data = this.trailService.geoJSON;
      this.markers = {};
      this.paths = {};
      this.layers.overlays = {};
    }

    if (this.geoJson.data) {
      if (first) {
        console.log(this.geoJson);
        this.center.lng = this.geoJson.data.features[0].geometry.coordinates[0][0][0];
        this.center.lat = this.geoJson.data.features[0].geometry.coordinates[0][0][1];
        this.center.zoom = 15;
      }

      this.markers.ship = {
        lat: this.geoJson.data.features[0].geometry.coordinates[0][0][1],
        lng: this.geoJson.data.features[0].geometry.coordinates[0][0][0],
        message: 'Schiff XY',
        draggable: false,
        iconAngle: 90
      };
    } else {
      this.trailService.tracksData.forEach((trackData: ITrackData, i: number) => {
        if (this.paths[trackData.id]) {
          this.paths[trackData.id].latlngs = trackData.coordinates;
        } else {
          this.paths[trackData.id] = {
            color: this.getColor(i),
            weight: 6,
            latlngs: trackData.coordinates,
            layer: 'track' + i
          };
        }

        let marker = this.markers['ship' + trackData.id];
        if (marker && trackData.coordinates.length > 0) {
          marker.lat = trackData.coordinates[trackData.coordinates.length - 1].lat;
          marker.lng = trackData.coordinates[trackData.coordinates.length - 1].lng;
          if (trackData.coordinates.length >= 2) {
            marker.iconAngle = 90 + this.getAngle(trackData.coordinates[trackData.coordinates.length - 1],
                trackData.coordinates[trackData.coordinates.length - 2]);
          }
        } else if (trackData.coordinates.length > 0) {
          console.log(this.getShipName(trackData.id));
          this.markers['ship' + trackData.id] = {
            lat: trackData.coordinates[trackData.coordinates.length - 1].lat,
            lng: trackData.coordinates[trackData.coordinates.length - 1].lng,
            label: {message: this.getShipName(trackData.id)},
            draggable: false,
            iconAngle: 0,
            icon: this.icon
          };
        }

        console.log(trackData.events);
        trackData.events.forEach((event: IEvent, ei: number) => {
          event.coordinates.forEach((c, ci) => {
            if (this.paths[trackData.id + '_e' + ei + '_p' + ci]) {
              angular.extend(this.paths[trackData.id + '_e' + ei + '_p' + ci].latlngs, c);
            } else {
              this.paths[trackData.id + '_e' + ei + '_p' + ci] = {
                type: 'circleMarker',
                latlngs: c,
                stroke: false,
                fillColor: this.getEventColor(event.type),
                fillOpacity: 0.7,
                radius: 10,
                clickable: true,
                message: event.description,
                trackId: trackData.id,
                layer: 'trackEvents' + i,
                index: {ei: ei, ci: ci}
              };
            }
          });
          this.deleteNextPathsIfNecessary(trackData.id + '_e' + ei + '_p' + event.coordinates.length, trackData);
        });
        this.deleteNextPathsIfNecessary(trackData.id + '_e' + trackData.events.length + '_p0', trackData);
      });

      if (first) {
        this.center.lat = this.trailService.tracksData[0].coordinates[0].lat;
        this.center.lng = this.trailService.tracksData[0].coordinates[0].lng;
        this.center.zoom = 15;
        console.log(this.paths);
      }
    }

    this.trailService.loadedRecord.tracks.forEach((track: ITrackMetaData, i: number) => {
      this.layers.overlays['track' + i] = {
        name: track.shipName,
        visible: true,
        type: 'group'
      };
      this.layers.overlays['trackEvents' + i] = {
        name: track.shipName + ' Events',
        visible: true,
        type: 'group'
      };
    });
  }

  private deleteNextPathsIfNecessary(check: string, trackData: ITrackData) {
    if (this.paths[check]) {
      for (let p in this.paths) {
        let index: {ei: number, ci: number} = this.paths[p].index;
        if (index && (index.ei >= trackData.events.length || index.ci >= trackData.events[index.ei].coordinates.length)) {
          delete this.paths[p];
        }
      }
    }
  }

  private getShipName(trackId: string): string {
    return this.trailService.loadedRecord.tracks.filter((track: ITrackMetaData) => track.id === trackId)[0].shipName;
  }

  private getAngle(p1: ILatLng, p2: ILatLng): number {
    return Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * 180 / Math.PI;
  }

  private getColor(i?: number): string {
    switch (i) {
      case 0:
        return '#6DBDD6';
      case 1:
        return '#B71427';
      case 2:
        return '#FFE658';
      case 3:
        return '#404040';
      case 4:
        return '#118C4E';
      case 5:
        return '#FF9009';
      default:
        return 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
    }
  }

  private getEventColor(type: string): string {
    return '#333333';
  }
}
