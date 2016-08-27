/// <reference path='../../typings/index.d.ts' />

import { config } from './index.config';
import './index.polyfill';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { TrailService } from './components/trailService/trailService.service';
import { navbar } from './components/navbar/navbar.directive';
import { MapController } from './components/map/map.controller';
import { MenuController } from './components/menu/menu.controller';
import { LiveService } from './components/liveService/liveService.service';

declare var malarkey: any;
declare var moment: moment.MomentStatic;

module gulpAngular {
  'use strict';

  angular.module('gulpAngular', ['ngAnimate', 'ngSanitize', 'ngMessages', 'ui.router', 'ui.bootstrap', 'toastr', 'leaflet-directive'])
    .config(config)
    .config(routerConfig)
    .run(runBlock)
    .service('trailService', TrailService)
    .service('liveService', LiveService)
    .controller('MainController', MainController)
    .controller('MapController', MapController)
    .controller('MenuController', MenuController)
    .directive('navbar', navbar)
    .filter('filesize', function () {
      return function (size: number) {
        if (isNaN(size)) {
          size = 0;
        }

        if (size < 1024) {
          return size + ' Bytes';
        }

        size /= 1024;

        if (size < 1024) {
          return size.toFixed(2) + ' Kb';
        }

        size /= 1024;
        return size.toFixed(2) + ' Mb';
      };
    });
}
