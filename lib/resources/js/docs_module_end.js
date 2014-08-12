/*============ CREATE THE docsApp MODULE AND REGISTER FACTORIES, DIRECTIVES, CONTROLLERS ============*/

angular.module('docsApp', [
    'ui.bootstrap', 'ngRoute',
    'docular.directives',
    'docular.services',
    'docular.controllers'
].concat(window.config.angularModules || []))
.constant('config', config)
.config(['$locationProvider', '$routeProvider', 'config', function($locationProvider, $routeProvider, config) {
    $locationProvider.html5Mode(config.useHtml5Mode);
    $routeProvider.when('/documentation/:group/index', {
        controller: 'GroupIndexController',
        templateUrl: 'resources/docular-partials/docular_partial_group_index.html'
    });
    $routeProvider.when('/documentation/:group/:section/:partial', {
        controller: 'DocumentationPageController',
        templateUrl: 'resources/docular-partials/docular_partial_documentation.html'
    });
    $routeProvider.when('/', {
        controller: 'HomepageController',
        templateUrl: 'resources/docular-partials/docular_partial_home.html'
    });
    $routeProvider.otherwise({
        templateUrl: 'resources/docular-partials/docular_partial_404.html',
        controller: ['$scope', function ($scope) {
            $scope.mainpage.partialTitle = '404';
        }]
    });
}]);
