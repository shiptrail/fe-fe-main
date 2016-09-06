import { TrailService } from './trailService.service';

describe('service TrailService', () => {

  beforeEach(angular.mock.module('gulpAngular'));

  it('should be registered', inject((trailService: TrailService) => {
    expect(trailService).not.toEqual(null);
  }));

  it('get path should return array of object', inject((trailService: TrailService, $httpBackend: angular.IHttpBackendService) => {
    $httpBackend.when('GET',  'http://localhost:9000/records').respond(200, {records: [{date: '2016-08-10T00:12:49.424Z', tracks: []}, {date: '2016-08-10T00:12:49.424Z', tracks: []}]});

    $httpBackend.flush();
    expect(trailService.records.length).toBe(2);

    trailService.records.forEach((record: any) => {
      expect(record).not.toBeNull();
    });

    // expect($log.error.logs).toEqual(jasmine.stringMatching('XHR Failed for'));
  }));
});
