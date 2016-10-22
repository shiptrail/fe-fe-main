import { LiveService } from '../liveService/liveService.service';
import { IEnvironmentConfig } from '../../index.module';

export interface ISubscriber {
  update: (boolean?) => void; // tslint:disable-line
  updateEditor?: (MapController) => void; // tslint:disable-line
}

export interface ILatLng {
  lat: number;
  lng: number;
  time: number;
}

export interface IRecord {
  id: string;
  name: string;
  date: string;
  length: string;
  location: string;
  type: string;
  tracks: Array<ITrackMetaData>;
}

export interface ITrackData {
  id: string;
  coordinates: Array<ILatLng>;
  events: Array<IEvent>;
}

export interface IEvent {
  type: string;
  coordinates: Array<ILatLng>;
  description: string;
}

export interface  ITrackMetaData {
  id: string;
  shipName: string;
}

export class TrailService {
  public records: Array<IRecord> = [];
  public geoJSON: any;
  public _tracksData: Array<ITrackData>;
  get tracksData(): Array<ITrackData> {
    if (this.$state.is('main.edit')) { return this._tracksData; }

    return this._tracksData.map(track => {
      return {
        id: track.id,
        events: track.events.map((event: IEvent) => angular.extend({}, event, {coordinates: event.coordinates.filter(c => (!this.time) || c.time <= this.time)}))
          .filter((event: IEvent) => event.coordinates.length > 0),
        coordinates: track.coordinates.filter(c => (!this.time) || c.time <= this.time)
      };
    });
  }
  public loadedRecord: IRecord;
  public play: boolean;
  public time: number;
  public timeStart: number;
  public timeEnd: number;
  public speed: number = 0.2;

  public lastLoadingTime: number = 0;
  public lastLoadingSize: number = 0;

  private subscribers: Array<ISubscriber> = [];
  private interval;

  /** @ngInject */
  constructor(private $http: angular.IHttpService, private $filter: angular.IFilterService,
              private $interval: angular.IIntervalService, private $state: angular.ui.IStateService,
              private $rootScope: angular.IRootScopeService, private liveService: LiveService, private environmentConfig: IEnvironmentConfig) {
    this.liveService.trailservice = this;
    this.$rootScope.$on('$stateChangeSuccess', () => this.updateSubscribers());
    this.loadTracks();
  }

  subscribe(sub: ISubscriber) {
    this.subscribers.push(sub);
  }

  unsubscribe(sub: ISubscriber) {
    this.subscribers.splice(this.subscribers.indexOf(sub), 1);
  }

  loadTracks() {
    let time = new Date();
    this.$http.get(this.environmentConfig.API_TRAILSERVICE).then((result: angular.IHttpPromiseCallbackArg<{records: Array<IRecord>}>) => {
      this.records = result.data.records.map((record: IRecord) => {
        record.date = this.$filter('date')(record.date, 'd.M.yy');
        record.type = record.tracks.length === 1 ? 'Single' : 'Multi';
        return record;
      });
      this.lastLoadingTime = new Date().getTime() - time.getTime();
      this.lastLoadingSize = angular.toJson(result.data).length;
    });
  }

  reset() {
    this._tracksData = null;
    this.geoJSON = null;
    this.timeStart = null;
    this.timeEnd = null;
    this.time = null;
    this.speed = 0.2;
    this.play = false;
    if (this.interval) {
      this.$interval.cancel(this.interval);
    }
  }

  loadRecord(record: IRecord): angular.IPromise<void> {
    let time = new Date();
    if (record.date === 'now') { // live
      this.reset();
      this.loadedRecord = record;
      this._tracksData = record.tracks.map(track => {
        return {
          id: track.id,
          events: [],
          coordinates: []
        };
      });
      this.updateSubscribers(true);
      this.liveService.followLive();
      return;
    }
    return this.$http.get(`assets/mockBackend/${record.tracks.map(track => track.id).join('_')}.json`).then((result: angular.IHttpPromiseCallbackArg<any>) => {
      this.lastLoadingTime = new Date().getTime() - time.getTime();
      this.lastLoadingSize = angular.toJson(result.data).length;
      this.reset();
      this.loadedRecord = record;
      if (result.data.type === 'FeatureCollection') {
        this.geoJSON = result.data;
      } else {
        console.log('result.data:'+result.data)
        this._tracksData = record.tracks.map(track => {
          console.log('custom format');
          console.log('track.id:'+track.id);
          console.log('track.shipName:'+track.shipName);
          console.log('data[track.id]:'+result.data[track.id]);
          return {
            id: track.id,
            events: result.data[track.id].events.map((event: IEvent) => angular.extend({}, event, {
              //console.log('track id:'+track.id+' event.type:'+event.type+' event.description:'+event.description);
              coordinates: event.coordinates.map(c => {
                //console.log('event type:'+event.type+' coords:lat'+c[1]+',lon:'+c[0]+',time:'+c[2]);
                return {lat: c[0], lng: c[1], time: c[2]};
              })
            })),
            coordinates: result.data[track.id].coordinates.map(c => {
              //console.log('event type:'+event.type+' coords:lat'+c[1]+',lon:'+c[0]+',time:'+c[2]);
              return {lat: c[0], lng: c[1], time: c[2]};
            })
          };

        });
        this.timeStart = Math.floor(this._tracksData.reduce((x, cur) => Math.min(cur.coordinates[0].time, x), 1451606400000));
        this.timeEnd = Math.ceil(this._tracksData.reduce((x, cur) => Math.max(cur.coordinates[cur.coordinates.length - 1].time, x), -100000));
      }
      this.updateSubscribers(true);
    });
  }

  playPause() {
    if (this.play) {
      this.pause();
    } else {
      if (this._tracksData) {
        if (!this.time) {
          this.time = this.timeStart;
        }
        this.play = true;
        this.interval = this.$interval(() => {
          if (this.loadedRecord.date !== 'now' && (this.time < this.timeStart || this.time > this.timeEnd)) {
            return this.pause();
          }
          this.time = Math.floor((Number(this.time) + this.speed) * 10) / 10;
          this.updateSubscribers();
        }, 100);
        this.updateSubscribers();
      }
    }
  }

  pause() {
    this.play = false;
    this.$interval.cancel(this.interval);
  }

  changeSpeed(value: number) {
    this.speed += value;
    this.speed = Math.floor(this.speed * 100) / 100;
  }

  updateSubscribers(first?: boolean) {
    if (first) {
      this.subscribers.forEach((sub: ISubscriber) => sub.update(first));
    } else {
      this.subscribers.forEach((sub: ISubscriber) => sub.update());
    }
  }

  updateEditors(fn: (MapController) => void) { // tslint:disable-line
    this.subscribers.forEach((sub: ISubscriber) => {
      if (sub.updateEditor) {
        sub.updateEditor(fn);
      }
    });
  }

  cArrayToILatLng(coordinates: Array<number>): ILatLng {
    return {lat: coordinates[0], lng: coordinates[1], time: coordinates[2]};
  }
}
