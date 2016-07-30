import { TrailService, ILatLng } from './trailService.service';

describe('service TrailService', () => {

  beforeEach(angular.mock.module('gulpAngular'));

  it('should be registered', inject((trailService: TrailService) => {
    expect(trailService).not.toEqual(null);
  }));

  it('get path should return array of object', inject((trailService: TrailService, $httpBackend: angular.IHttpBackendService) => {
    $httpBackend.when('GET',  'assets/mockBackend/tracks.json').respond(200, {tracks: ['xyz', 'test']});

    $httpBackend.flush();
    expect(trailService.trackList.tracks.length).toBe(2);

    trailService.trackList.tracks.forEach((track: any) => {
      expect(track).not.toBeNull();
    });

    //expect($log.error.logs).toEqual(jasmine.stringMatching('XHR Failed for'));
  }));
});
