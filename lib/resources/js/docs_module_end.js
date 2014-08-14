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
    
    var documentationDeferral;
    var indexRouteInstruction = {
        controller: 'IndexPageController',
        templateUrl: 'resources/templates/index_page.html',
        resolve: {
            documents: ['$q', function ($q) {
                if(!documentationDeferral) {
                    documentationDeferral = $q.defer();
                }
                return documentationDeferral.promise;
            }],
            group: ['$route', 'config', '$q', 'documentation', function ($route, config, $q, documentationProvider) {
                function searchGroupForPath(path, haystack) {
                    if(haystack.path == path) { return haystack; }
                    if(!haystack.groups) { return false; }
                    for(var i = 0, l = haystack.groups.length; i < l; i ++) {
                        var result = searchGroupForPath(path, haystack.groups[i]);
                        if(result) {
                            return result;
                        }
                    }
                    return false;
                }
                
                var group;
                if($route.current.params.path === undefined) {
                    group = config; //Home page
                } else {
                    group = searchGroupForPath($route.current.params.path, config);
                }
                
                documentationProvider.search({
                    groupId: group.id
                }).then(function (results) {
                    documentationDeferral.resolve(results);
                    documentationDeferral = $q.defer(); //Reset after resolve;
                }).catch(documentationDeferral.reject);
                
                return group;
            }]
        }
    };
    
    $routeProvider.when('/documentation/:path*/index', indexRouteInstruction);
    $routeProvider.when('/documentation/:path*/docApi/:name*', indexRouteInstruction);
    $routeProvider.when('/', indexRouteInstruction);
    
    $routeProvider.otherwise({
        templateUrl: 'resources/templates/docular_partial_404.html',
        controller: ['$scope', function ($scope) {
            $scope.mainpage.partialTitle = '404';
        }]
    });
}]).run(['documentation', function (documentationProvider) {
    documentationProvider.load();
}]);
