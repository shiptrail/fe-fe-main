import { TrailService, IEvent } from '../trailService/trailService.service';
import { MapController } from '../map/map.controller';
import { IEnvironmentConfig } from '../../index.module';

interface IEventMessage {
  trackId: string;
  type: string;
  coordinates?: Array<Array<number>>;
  events?: Array<IEvent>;
}

export class LiveService {
  public trailservice: TrailService;
  private eventSource: EventSource;

  /** @ngInject */
  constructor(private environmentConfig: IEnvironmentConfig) {}

  followLive() {
    this.eventSource = new EventSource(this.environmentConfig.API_LIVESERVICE);
    this.eventSource.addEventListener('message', (event: {data: string}) => {
      let eventMessages: Array<IEventMessage> = JSON.parse(event.data);
      eventMessages.forEach(eventMessage => {
        switch (eventMessage.type) {
          case 'coordinates':
            let track = this.trailservice._tracksData.find(trackData => trackData.id === eventMessage.trackId);
            if (track) {
              if (eventMessage.events && eventMessage.events.length > 0) {
                track.events.push.apply(track.events, eventMessage.events.map((event: IEvent) => {
                  if (!event.description) {
                    event.description = event.type;
                  }
                  return angular.extend({}, event, {
                    coordinates: event.coordinates.map(c => {
                      return {lat: c[0], lng: c[1], time: c[2]};
                    })
                  });
                }));
              }
              track.coordinates.push.apply(track.coordinates, eventMessage.coordinates.map(this.trailservice.cArrayToILatLng));
              if (track.coordinates.length === 1) {
                this.trailservice.updateEditors((mapControler: MapController) => {
                  mapControler.center.lat = track.coordinates[0].lat;
                  mapControler.center.lng = track.coordinates[0].lng;
                  mapControler.center.zoom = 15;
                });
                this.trailservice.timeStart = Math.floor(this.trailservice._tracksData.reduce((x, trackData) => trackData.coordinates.length === 0 ? x : Math.min(trackData.coordinates[0].time, x), 100000));
              }
              this.trailservice.timeEnd = Math.ceil(this.trailservice._tracksData.reduce((x, trackData) => trackData.coordinates.length === 0 ? x : Math.max(trackData.coordinates[trackData.coordinates.length - 1].time, x), -100000)) + 2;
              this.trailservice.updateSubscribers();
            }
            break;
        }
      });
    });
  }
}
