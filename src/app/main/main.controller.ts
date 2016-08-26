import { TrailService } from '../components/trailService/trailService.service';

export class MainController {
  public toastr: any;

  /* @ngInject */
  constructor (public trailService: TrailService, toastr: any) {
    this.toastr = toastr;
  }

  showToastr() {
    this.toastr.info('Info Box');
  }
}
