import {TrailService} from "../trailService/trailService.service";
/** @ngInject */
export function navbar(): angular.IDirective {

  return {
    restrict: 'E',
    scope: {
      creationDate: '='
    },
    templateUrl: 'app/components/navbar/navbar.html',
    controller: NavbarController,
    controllerAs: 'vm',
    bindToController: true
  };

}

/** @ngInject */
export class NavbarController {
  public renderTime: number;
  /** @ngInject */
  constructor(public trailService: TrailService, $timeout: angular.ITimeoutService, $rootScope: angular.IRootScopeService) {
    //TODO: delete this code later
    setInterval(() => {
      let time: Date = new Date();
      $rootScope.$digest();
      $timeout(() => {
        this.renderTime = new Date().getTime() - time.getTime();
      });
    },1000);
  }
}
