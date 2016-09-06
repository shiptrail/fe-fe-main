import { MainController } from './main.controller';

describe('controllers', () => {
  let mainController: MainController;

  beforeEach(angular.mock.module('gulpAngular'));

  beforeEach(inject(($controller: angular.IControllerService) => {
    mainController = $controller('MainController');
  }));
});
