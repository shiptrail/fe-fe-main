/** @ngInject */
export function routerConfig($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) {
  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main',
    })
    .state('edit', {
      url: '/edit',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main'
    });

  $urlRouterProvider.otherwise('/');
}
