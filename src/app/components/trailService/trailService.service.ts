export interface ILatLng {
  lat: number;
  lng: number;
}

export interface ITrackList {
  tracks: Array<string>;
}

export class TrailService {
  public trackList: ITrackList = {tracks: []};

  public lastLoadingTime: number = 0;
  public lastLoadingSize: number = 0;

  /** @ngInject */
  constructor (private $http: angular.IHttpService) {
    let time = new Date();
    $http.get('assets/mockBackend/tracks.json').then((result: angular.IHttpPromiseCallbackArg<ITrackList>) => {
      this.trackList.tracks = result.data.tracks;
      this.lastLoadingTime = new Date().getTime() - time.getTime();
      this.lastLoadingSize = angular.toJson(result.data).length;
    });
  }

  loadTrack(track: string): angular.IPromise<angular.IHttpPromiseCallbackArg<any>> {
    let time = new Date();
    return this.$http.get(`assets/mockBackend/${track}`).then((result: angular.IHttpPromiseCallbackArg<any>) => {
      this.lastLoadingTime = new Date().getTime() - time.getTime();
      this.lastLoadingSize = angular.toJson(result.data).length;
      return result;
    });
  }
}
