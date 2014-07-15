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
    .directive('sourceViewer', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="source-viewer-container"></div>',
            scope: {
                source: '=',
                fileType: '='
            },
            compile: function () {
                return {
                    post: function ($scope, $element) {
                        $scope.$watch('source', function () {
                            $element.empty();
                            if(!$scope.source) { return; }
                            var compiled;
                            if($scope.fileType == 'ngdoc' || $scope.fileType === 'doc' || $scope.fileType === 'md') {
                                compiled = $compile( '<pre></pre>' )( $scope );
                                compiled.text($scope.source)
                            } else {
                                var sourceContent = '<script type="syntaxhighlighter" class="brush: ' + $scope.fileType + ';"><![CDATA[\n' + $scope.source + ']]></script>';
                                compiled = $compile( sourceContent )( $scope );
                            }
                            
                            $element.append(compiled);
                            SyntaxHighlighter.highlight(); //inherited from app controller
                        })
                    }
                }
            }
        }
    })
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
                '<h2><i class="{{group.groupIcon}} icon-white"></i> {{group.title}} </h2>',
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
                    console.log(scope.group)
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
                        iframe.attr('src', '/resources/docular-partials/example.html?' + JSON.stringify({
                            js: exampleJs,
                            css: exampleCss,
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
                                $interval.clear(resizingInterval);
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