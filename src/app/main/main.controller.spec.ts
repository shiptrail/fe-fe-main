import { MainController } from './main.controller';
import { TrailService } from '../components/trailService/trailService.service';

describe('controllers', () => {
  let mainController: MainController;

  beforeEach(angular.mock.module('gulpAngular'));

  beforeEach(inject(($controller: angular.IControllerService) => {
    mainController = $controller('MainController');
  }));
});
