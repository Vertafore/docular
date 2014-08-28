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
    $locationProvider.hashPrefix('!');
    
    /** This should be added to each resolve, to make sure that everything is loaded properly **/
    var loadAllDocsPartial = ['documentation', function (documentationProvider) {
        return documentationProvider.load();
    }];
    
    if(config.discussions && config.discussions.shortName) {
        var disqusShortname = config.discussions.shortName;
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqusShortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    }
    
    if(config.analytics && config.analytics.account) {
        window._gaq = window._gaq || [];
        _gaq.push(['_setAccount', config.analytics.account]);
        (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
        
    }
    
    var documentationDeferral;
    var indexRouteInstruction = {
        controller: 'IndexPageController',
        templateUrl: 'resources/templates/index_page.html',
        resolve: {
            allDocumentsLoaded: loadAllDocsPartial,
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
    $routeProvider.when('/documentation/:path*/docApi/:root/:name*', indexRouteInstruction);
    $routeProvider.when('/documentation/:path*/docApi/:name*', indexRouteInstruction);
    $routeProvider.when('/', indexRouteInstruction);
    $routeProvider.when('/search', {
        controller: 'SearchPageController',
        templateUrl: 'resources/templates/search_page.html',
        resolve: {
            allDocumentsLoaded: loadAllDocsPartial
        }
    });
    $routeProvider.otherwise({
        templateUrl: 'resources/templates/docular_partial_404.html',
        controller: ['pageData', function (pageData) {
            pageData.title = '404';
        }]
    });
}]).run(['$rootScope', '$location', 'config', function ($rootScope, $location, config) {
    if(config.analytics && config.analytics.account) {
        $rootScope.$on('$routeChangeSuccess', function () {
            window._gaq.push(['_trackPageview', $location.path()]);
        });
    }
}]);
