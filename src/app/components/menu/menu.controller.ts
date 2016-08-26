import { TrailService, IRecord, IEvent, ITrackData } from '../trailService/trailService.service';
import { MapController } from '../map/map.controller';

interface ILeafletDirectiveEventInfo {
  modelName: string;
  leafletEvent: L.LeafletMouseEvent;
}

export class MenuController {
  private activeEvent: IEvent;
  private activeTrack: ITrackData;
  private downloadLink: HTMLAnchorElement;
  private eventTypes: Array<string> = ['turn', 'X']; // tslint:disable-line

  public missingPoints: () => number|string = () => this.activeEvent ? this.getEventTypePointCount(this.activeEvent.type) - this.activeEvent.coordinates.length : 0;
  private lastEventColor: () => void = () => {};
  private doColorEventPoints: () => void = () => {};

  /* @ngInject */
  constructor(private $timeout: angular.ITimeoutService, public trailService: TrailService, public $state: angular.ui.IStateService, private $scope: angular.IScope) { // tslint:disable-line
    this.downloadLink = document.createElement('a');
    document.body.appendChild(this.downloadLink);
    this.downloadLink.style.display = 'none';
    this.$scope.$on('leafletDirectivePath.click', (event: any, info: ILeafletDirectiveEventInfo) => {
      this.addPoint(info);
    });
  }

  loadRecord(record: IRecord) {
    this.trailService.loadRecord(record);
  }

  clickPlayPause() {
    this.trailService.playPause();
  }

  addEvent(track: ITrackData) {
    this.activeTrack = track;
    this.activeEvent = {
      type: null,
      coordinates: [],
      description: ''
    };
    track.events.push(this.activeEvent);
  }

  addPoint(info: ILeafletDirectiveEventInfo) {
    if (this.activeEvent && this.activeTrack && this.activeTrack.id === info.modelName) {
      let lowestDistance = this.activeTrack.coordinates.reduce((d, c) => Math.min(d, info.leafletEvent.latlng.distanceTo(c)), 10000);
      let time = this.activeTrack.coordinates.filter(c => info.leafletEvent.latlng.distanceTo(c) === lowestDistance)[0].time;
      if (this.missingPoints() <= 0) {
        this.activeEvent.coordinates.length = 0;
      }
      this.activeEvent.coordinates.push({
        lat: info.leafletEvent.latlng.lat,
        lng: info.leafletEvent.latlng.lng,
        time: time
      });
      this.trailService.updateSubscribers();
      this.doColorEventPoints();
    }
  }

  clickEvent(track: ITrackData, event: IEvent) {
    this.lastEventColor();
    this.activeEvent = event;
    this.activeTrack = track;
    this.trailService.updateEditors((map: MapController) => {
      map.center.lat = event.coordinates[0].lat;
      map.center.lng = event.coordinates[0].lng;

      let i = track.events.indexOf(event);
      let lastColor = map.paths[track.id + '_e' + i + '_p0'].color;
      let lastPathColor = map.paths[track.id].color;
      this.lastEventColor = () => {
        event.coordinates.forEach((_, ci) => map.paths[track.id + '_e' + i + '_p' + ci].fillColor = lastColor);
        map.paths[track.id].color = lastPathColor;
      };
      this.doColorEventPoints = () => {
        event.coordinates.forEach((_, ci) => map.paths[track.id + '_e' + i + '_p' + ci].fillColor = '#ff00ff');
        map.paths[track.id].color = '#cc6699';
      };
      this.doColorEventPoints();
    });
  }

  save() {
    if (this.trailService._tracksData.some((track: ITrackData) => track.events.some((event: IEvent) => event.coordinates.length !== this.getEventTypePointCount(this.activeEvent.type)))) {
      alert('Es gibt Events, die noch nicht die richtige Anzahl Punkte haben');
    }

    let data = {};
    this.trailService._tracksData.forEach((track: ITrackData) => {
      data[track.id] = {
        coordinates: track.coordinates,
        events: track.events
      };
    });
    let json = angular.toJson(data),
      blob = new Blob([json], {type: 'octet/stream'}),
      url = window.URL.createObjectURL(blob);
    this.downloadLink.href = url;
    this.downloadLink['download'] = this.trailService.loadedRecord.id + '.json';
    this.downloadLink.click();
    window.URL.revokeObjectURL(url);
  }

  getEventTypePointCount(type: string): number {
    switch (type) {
      case 'turn':
        return 3;
      default:
        return 1;
    }
  }
}
