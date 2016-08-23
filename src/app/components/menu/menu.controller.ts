import { TrailService, ILatLng, IRecord, ITrackMetaData, IEvent, ITrackData } from '../trailService/trailService.service';
import { MapController } from "../map/map.controller";

export class MenuController {
  private activeEvent: IEvent;
  private activeTrack: ITrackData;
  private downloadLink: HTMLAnchorElement;
  private eventTypes: Array<string> = ['turn', 'X'];
  private lastEventColor: () => void = () => {};

  /* @ngInject */
  constructor (public trailService: TrailService, public $state: angular.ui.IStateService, private $timeout: angular.ITimeoutService) {
    this.downloadLink = document.createElement("a");
    document.body.appendChild(this.downloadLink);
    this.downloadLink.style.display = "none";
  }

  loadRecord(record: IRecord) {
    this.trailService.loadRecord(record);
  }

  clickPlayPause() {
    this.trailService.playPause();
  }

  addEvent(track: ITrackData) {
    this.activeEvent = {
      type: null,
      coordinates: [],
      description: ''
    };
    track.events.push(this.activeEvent);
  }

  clickEvent(track: ITrackData, event: IEvent) {
    this.lastEventColor();
    this.activeEvent = event;
    this.activeTrack = track;
    this.trailService.updateEditors((map: MapController) => {
      map.center.lat = event.coordinates[0].lat;
      map.center.lng = event.coordinates[0].lng;

      let i = track.events.indexOf(event);
      let lastColor = map.paths[track.id + '_e' + i].color;
      this.lastEventColor = () => {
        map.paths[track.id + '_e' + i].color = lastColor;
      };
      map.paths[track.id + '_e' + i].color = '#ff00ff';
    });
  }

  save() {
    let data = {};
    this.trailService._tracksData.forEach((track) => {
      data[track.id] = {
        coordinates: track.coordinates,
        events: track.events
      }
    });
    let json = angular.toJson(data),
    blob = new Blob([json], {type: "octet/stream"}),
    url = window.URL.createObjectURL(blob);
    this.downloadLink.href = url;
    this.downloadLink['download'] = this.trailService.loadedRecord.id + '.json';
    this.downloadLink.click();
    window.URL.revokeObjectURL(url);
  }
}
