import { TrailService, ILatLng, ITrackList } from '../trailService/trailService.service';

export class MapController {
  public center: any = {};
  public markers: any = {};
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

  public trackList: ITrackList;

  /* @ngInject */
  constructor (public trailService: TrailService) {
    this.trackList = trailService.trackList;
  }

  loadTrack(track: string) {
    this.trailService.loadTrack(track).then(result => {
      this.geoJson.data = result.data;
      console.log(this.geoJson);
      this.center.lng = this.geoJson.data.features[0].geometry.coordinates[0][0][0];
      this.center.lat = this.geoJson.data.features[0].geometry.coordinates[0][0][1];
      this.center.zoom = 14;

      this.markers.start = {
        lat: this.geoJson.data.features[0].geometry.coordinates[0][0][1],
        lng: this.geoJson.data.features[0].geometry.coordinates[0][0][0],
        message: 'Hier ist der erste Punkt',
        draggable: false
      };
    });
  }
}
