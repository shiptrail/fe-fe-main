/// <reference path='../../typings/index.d.ts' />

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { TrailService } from './components/trailService/trailService.service';
import { navbar } from './components/navbar/navbar.directive';
import { MapController } from './components/map/map.controller';

declare var malarkey: any;
declare var moment: moment.MomentStatic;

module gulpAngular {
  'use strict';

  angular.module('gulpAngular', ['ngAnimate', 'ngSanitize', 'ngMessages', 'ui.router', 'ui.bootstrap', 'toastr', 'leaflet-directive'])
    .config(config)
    .config(routerConfig)
    .run(runBlock)
    .service('trailService', TrailService)
    .controller('MainController', MainController)
    .controller('MapController', MapController)
    .directive('navbar', navbar)
    .filter('filesize', function () {
      return function (size) {
        if (isNaN(size))
          size = 0;

        if (size < 1024)
          return size + ' Bytes';

        size /= 1024;

        if (size < 1024)
          return size.toFixed(2) + ' Kb';

        size /= 1024;

        if (size < 1024)
          return size.toFixed(2) + ' Mb';

        size /= 1024;

        if (size < 1024)
          return size.toFixed(2) + ' Gb';

        size /= 1024;

        return size.toFixed(2) + ' Tb';
      };
    });
}
