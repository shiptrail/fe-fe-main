import { TrailService, ILatLng, ITrackData } from '../trailService/trailService.service';
import IExceptionHandlerService = angular.IExceptionHandlerService;
import {IEvent} from "../trailService/trailService.service";

export class MapController {
  private icon = {
    iconUrl: 'assets/icon_ship.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
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

  /* @ngInject */
  constructor (public trailService: TrailService, private $scope: angular.IScope) {
    this.$scope.$on('$destroy', () => this.trailService.unsubscribe(this));
    this.trailService.subscribe(this);
  }

  public updateEditor(mapFn: (MapController) => void) {
    mapFn(this);
  }

  public update(first: boolean): void {
    if(first) {
      this.geoJson.data = this.trailService.geoJSON;
      this.markers = {};
      this.paths = {};
      this.layers.overlays = {};
    }

    if(this.geoJson.data) {
      if(first) {
        console.log(this.geoJson);
        this.center.lng = this.geoJson.data.features[0].geometry.coordinates[0][0][0];
        this.center.lat = this.geoJson.data.features[0].geometry.coordinates[0][0][1];
        this.center.zoom = 14;
      }

      this.markers.ship = {
        lat: this.geoJson.data.features[0].geometry.coordinates[0][0][1],
        lng: this.geoJson.data.features[0].geometry.coordinates[0][0][0],
        message: 'Schiff XY',
        draggable: false,
        iconAngle: 90
      };
    }else{
      this.trailService.tracksData.forEach((trackData: ITrackData, i) => {
        this.paths[trackData.id] = {
          color: this.getColor(i),
          weight: 4,
          latlngs: trackData.coordinates,
          layer: 'track'+i
        };

        let marker = this.markers['ship' + trackData.id];
        if(marker && trackData.coordinates.length > 0) {
          marker.lat = trackData.coordinates[trackData.coordinates.length - 1].lat;
          marker.lng = trackData.coordinates[trackData.coordinates.length - 1].lng;
          if(trackData.coordinates.length >= 2){
            marker.iconAngle = 90 + this.getAngle(trackData.coordinates[trackData.coordinates.length - 1],
              trackData.coordinates[trackData.coordinates.length - 2]);
          }
        }else if(trackData.coordinates.length > 0) {
          console.log(this.getShipName(trackData.id));
          this.markers['ship' + trackData.id] = {
            lat: trackData.coordinates[trackData.coordinates.length - 1].lat,
            lng: trackData.coordinates[trackData.coordinates.length - 1].lng,
            label: { message: this.getShipName(trackData.id) },
            draggable: false,
            iconAngle: 0,
            icon: this.icon
          };
        }

        console.log(trackData.events);
        trackData.events.forEach((event: IEvent, i: number) => {
          this.paths[trackData.id + '_e' + i] = {
            color: this.getEventColor(event.type),
            weight: 8,
            latlngs: event.coordinates,
            message: event.description,
            trackId: trackData.id,
            index: i
          }
        });
        if(this.paths[trackData.id + '_e' + trackData.events.length]){
          for(let p in this.paths) {
            if(this.paths[p].trackId === trackData.id && this.paths[p].index >= trackData.events.length) {
              delete this.paths[p];
            }
          }
        }
      });

      if(first) {
        this.center.lat = this.trailService.tracksData[0].coordinates[0].lat;
        this.center.lng = this.trailService.tracksData[0].coordinates[0].lng;
        this.center.zoom = 14;
        console.log(this.paths);
      }
    }

    this.trailService.loadedRecord.tracks.forEach((track, i) => {
      this.layers.overlays['track'+i] = {
        name: track.shipName,
        visible: true,
        type: 'group'
      }
    })
  }

  private getShipName(trackId: string): string {
    return this.trailService.loadedRecord.tracks.filter(track => track.id == trackId)[0].shipName;
  }

  private getAngle(p1,p2): number {
    return Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * 180 / Math.PI;
  }

  private getColor(i?: number): string {
    switch(i) {
      case 0: return '#6DBDD6';
      case 1: return '#B71427';
      case 2: return '#FFE658';
      case 3: return '#404040';
      case 4: return '#118C4E';
      case 5: return '#FF9009';
      default: return 'rgb(' + ~~(Math.random() * 256) + ',' + ~~(Math.random() * 256) + ',' + ~~(Math.random() * 256) + ')';
    }
  }

  private getEventColor(type: string): string {
    return '#333333';
  }
}
