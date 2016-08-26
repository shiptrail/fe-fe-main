/** @ngInject */
export function routerConfig($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) {
  $stateProvider
    .state('main', {
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main',
      abstract: true
    })
    .state('main.home', {
      url: '/'
    })
    .state('main.edit', {
      url: '/edit'
    });

  $urlRouterProvider.otherwise('/');
}
