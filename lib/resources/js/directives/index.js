angular.module('docular.directives', [])
    .directive('focused', ['$timeout', function ($timeout) {
        return {
            link: function(scope, element, attrs) {
                element[0].focus();
                element.bind('focus', function() {
                    scope.$apply(attrs.focused + '=true');
                });
                element.bind('blur', function() {
                    // have to use $timeout, so that we close the drop-down after the user clicks,
                    // otherwise when the user clicks we process the closing before we process the click.
                    $timeout(function() {
                        scope.$eval(attrs.focused + '=false');
                    }, 1000);
                });
                scope.$eval(attrs.focused + '=true');
            }
        };
    }])
    .directive('disqus', ['$interval', '$location', function ($interval, $location) {
        return {
            restrict: 'E',
            templateUrl: 'resources/templates/disqus.html',
            link: {
                post: function ($scope) {
                    var checkInterval = $interval(function () {
                        if(window.DISQUS) {
                            $interval.cancel(checkInterval);
                            DISQUS.reset({
                                reload: true,
                                config: function () {
                                    this.page.identifier = $location.path();
                                    this.page.url = $location.absUrl();
                                }
                            })
                        }
                    }, 200);
                    
                    $scope.$on('$destroy', function () {
                        $interval.cancel(checkInterval);
                    });
                }
            }
        }
    }])
    .directive('menuDropdown', ['$compile', '$timeout', function ($compile, $timeout) {
        return {
            restrict: 'E',
            scope: {
                groups: '='
            },
            replace: true,
            priority: 1100,
            templateUrl: 'resources/templates/menu.html',
            link: {
                post: function ($scope, $element) {
                    if($scope.groups) {
                        $timeout(function () {
                            for(var i = 0, l = $scope.groups.length; i < l; i++) {
                                var li = angular.element($element.find('> li > .dd-dropdown-container').get(i));
                                var $newScope = $scope.$new();
                                $newScope.groups = $scope.groups[i].groups;
                                var $el = $compile('<menu-dropdown groups="groups" class="nav navbar-nav"></menu-dropdown>')($newScope);
                                li.append($el);
                            }
                        }, 100)
                    }
                }
            }
        }
    }])
    .directive('sourceViewer', ['$compile', 'LanguageFileSuffixes', function ($compile, LanguageFileSuffixes) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                source: '=?',
                fileType: '@'
            },
            priority: 0,
            compile: function (el) {
                var script = el[0].textContent;
                el[0].innerText = el[0].textContent = "";
                return {
                    post: function ($scope, $element) {
                        $scope.$watch('source', function () {
                            $element.empty();
//                            if(!$scope.source) { return; }
                            var compiled;
                            var fileType = 'markdown';
                            
                            if(LanguageFileSuffixes[$scope.fileType]) {
                                fileType = LanguageFileSuffixes[$scope.fileType];
                            }
                            
                            var sourceContent = '<div class="source-viewer-container"><pre><code class="' + fileType + '"></code></pre></div>';
                            compiled = $compile( sourceContent )( $scope );
                            compiled.find('code').text($scope.source || script);
                            $element.empty().append(compiled);
                            hljs.highlightBlock(compiled.find('pre')[0]);
                        })
                    }
                }
            }
        }
    }])
    .directive('render', ['$compile', 'markdown', function ($compile, markdownService) {
        return {
            restrict: 'E',
            scope: {
                content: '='
            },
            link: {
                pre: function ($scope, $element) {
                    $element.empty();
                    var compiled = $compile(markdownService($scope.content))($scope);
                    $element.append(compiled);
                }
            }
        }
    }])
    .directive('documentationGroupList', function () {
        return {
            restrict: 'E',
            replace: true,
            template: [
                '<div class="documentation-groups">',
                '<div ng-repeat="group in docGroups" class="documentation-group" ng-show="group.visible">',
                '<h2><i class="{{group.groupIcon}} icon-white"></i> {{group.title}} </h2>',
                '<div class="documentation-group-info">',
                '<ul>',
                '<li ng-repeat="section in group.sections" class="documentation-group-section">',
                '<a href="{{section.url}}">{{section.title}}</a>',
                '</li>',
                '</ul>',
                '</div>',
                '</div>',
                '</div>'
            ].join('')
        };
    })
    .directive('documentationSectionList', function () {
        return {
            restrict: 'E',
            replace: true,
            template: [
                '<div class="section-group">',
                '<div class="hero-unit" ng-show="showHeader">',
                '<h2><i class="{{group.groupIcon}} icon-white"></i> {{group.groupTitle}} </h2>',
                '</div>',
                '<ol class="rounded-list">',
                '<li ng-repeat="section in group.sections" class="documentation-group-section">',
                '<a href="{{section.url}}">{{section.title}}</a>',
                '</li>',
                '</ol>',
                '</div>'
            ].join(''),
            link: function(scope, element, attrs) {

                scope.showHeader = attrs.header === "false" ? false : true;

                var setGroup = function(newValue, oldValue){
                    var groupId = newValue;
                    var allGroups = scope.docGroups;
                    for(var i=0; i < allGroups.length; i++) {
                        if(allGroups[i].id == groupId) {
                            scope.group = allGroups[i];
                        }
                    }
                };

                if(attrs.group){
                    setGroup(attrs.group);
                } else {
                    scope.$parent.$watch('currentGroupId', setGroup);
                }
            }
        };
    })
    .directive('pageList', function () {
        return {
            restrict: 'E',
            replace: true,
            template: [
                '<ol class="rounded-list">',
                '<li ng-repeat="page in sectionPages" ng-show="page.id != \'index\'"><a href="{{page.url}}">{{page.shortName}}</a></li>',
                '</ol>'
            ].join(''),
            link: function(scope, element, attrs) {
                scope.sectionPages = scope.$parent.sectionPages;
            }
        };
    })
    .directive('docularPager', function () {
        return {
            restrict: 'E',
            replace: true,
            template: [
                '<ul class="pager">',
                '<li class="previous" ng-show="prevPage.exists"><a href="{{prevPage.url}}">&lt;&lt; {{prevPage.title}}</a></li>',
                '<li class="next" ng-show="nextPage.exists"><a href="{{nextPage.url}}">{{nextPage.title}} &gt;&gt;</a></li>',
                '</ul>'
            ].join(''),
            link: function(scope, element, attrs) {

                var getPageIndex = function (pages, pageId) {
                    for(var i=0; i < pages.length; i++) {
                        if(pages[i].id == pageId){
                            return i;
                        }
                    }
                };

                var getNextPage = function (pages, ci) {
                    if(currentIndex + 1 < pages.length && pages.length > 0){

                        if(currentIndex +1 == pages.length -1){
                            if(pages[pages.length-1].id != "index") {
                                return {exists: true, title: pages[ci+ 1].shortName, url: pages[ci+1].url};
                            } else {
                                return {exists:false, title:'', url:''};
                            }
                        }

                        return {exists:true, title: pages[ci + 1].shortName, url: pages[ci+1].url};

                    } else {
                        return {exists:false, title:'', url:''};
                    }
                };

                var getPrevPage = function (pages, ci) {
                    if(ci !== 0){
                        return {exists: true, title: pages[ci - 1].shortName, url: pages[ci - 1].url};
                    } else {
                        return {exists: false, title:'', url:''};
                    }
                };

                var sectionPages = scope.$parent.sectionPages;
                var currentPageId = scope.$parent.page.id;
                var currentIndex = getPageIndex(sectionPages, currentPageId);

                scope.nextPage = getNextPage(sectionPages, currentIndex);
                scope.prevPage = getPrevPage(sectionPages, currentIndex);

            }
        };
    })
    .directive('exampleRunner', ['$interval', function ($interval) {
        return {
            restrict: 'A',
            
            compile: function (element) {
                var data = JSON.parse(element.text());
                element.replaceWith('<div id="demoArea" class="well"></div>')
                return {
                    post: function ($scope, $element) {
                        
                        var iframe = $("<iframe>");
                        iframe.attr('src', 'resources/docular-partials/example.html?' + JSON.stringify({
                            js: exampleJs,
                            css: exampleCss,
                            baseUrl: baseURL,
                            loadAngular: loadAngular,
                            module: data.module
                        }));
                        iframe.appendTo($element);
                        
                        iframe.load(function () {
                            var iframeDoc = $(iframe.contents());
                            var i, l, script, style;
                            
                            for (i = 0, l = data.js.length; i < l; i++) {
                                script = iframeDoc[0].createElement('script');
                                iframeDoc[0].head.appendChild(script);
                                script.innerHTML = data.js[i].content;
                            }
                            
                            for (i = 0, l = data.css.length; i < l; i++) {
                                style = iframeDoc[0].createElement('style');
                                iframeDoc[0].head.appendChild(style);
                                style.innerHTML = data.css[i].content;
                            }
                            
                            iframeDoc.find('body').html(data.html[0].content);
                            
                            if (window.autoloadExamples) {
                                script = iframeDoc[0].createElement('script');
                                iframeDoc[0].body.appendChild(script);
                                script.innerHTML = 'angular.bootstrap(document, ["' + data.module + '"]);';
                            }
                            var resizingInterval = $interval(function () {
                                var height = iframeDoc.find('body').height();
                                iframe.css({
                                    minHeight: height
                                });
                            }, 500);
                            $scope.$on('$destroy', function () {
                                $interval.cancel(resizingInterval);
                            });
                        });
                        
                    }
                }
            }
        }
    }])
    .directive('code', function () {
        return { restrict:'E', terminal: true };
    });