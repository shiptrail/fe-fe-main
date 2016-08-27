import { ILatLng, TrailService } from '../trailService/trailService.service';
import {MapController} from "../map/map.controller";

interface IEventMessage {
  trackId: string;
  type: string;
  coordinates?: Array<Array<number>>;
}

export class LiveService {
  private eventSource: EventSource;
  public trailservice: TrailService;

  constructor() {}

  followLive() {
    this.eventSource = new EventSource('http://localhost:8000/events');
    this.eventSource.addEventListener('add', (event: {data: string}) => {
      let eventMessages: Array<IEventMessage> = JSON.parse(event.data);
      eventMessages.forEach(eventMessage => {
        switch(eventMessage.type) {
          case 'coordinates':
            let track = this.trailservice._tracksData.find(trackData => trackData.id == eventMessage.trackId);
            if(track) {
              track.coordinates.push.apply(track.coordinates, eventMessage.coordinates.map(this.trailservice.cArrayToILatLng));
              if(track.coordinates.length == 1){
                this.trailservice.updateEditors((mapControler: MapController) => {
                  mapControler.center.lat = track.coordinates[0].lat;
                  mapControler.center.lng = track.coordinates[0].lng;
                  mapControler.center.zoom = 15;
                });
                this.trailservice.timeStart = Math.floor(this.trailservice._tracksData.reduce((x, trackData) => trackData.coordinates.length == 0? x: Math.min(trackData.coordinates[0].time, x), 100000));
              }
              this.trailservice.timeEnd = Math.ceil(this.trailservice._tracksData.reduce((x, trackData) => trackData.coordinates.length == 0? x: Math.max(trackData.coordinates[trackData.coordinates.length - 1].time, x), -100000))+2;
              this.trailservice.updateSubscribers();
            }
            break;
        }
      });
    })
  }
}
