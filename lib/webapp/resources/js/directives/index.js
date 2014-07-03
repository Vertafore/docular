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
                    });
                });
                scope.$eval(attrs.focused + '=true');
            }
        };
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
    .directive('pager', function () {
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
                var currentPageId = scope.$parent.currentPage.id;
                var currentIndex = getPageIndex(sectionPages, currentPageId);

                scope.nextPage = getNextPage(sectionPages, currentIndex);
                scope.prevPage = getPrevPage(sectionPages, currentIndex);

            }
        };
    })
    .directive('viewSource', ['$timeout', '$compile', function ($timeout, $compile) {
        return {
            restrict: 'E',
            replace: true,
            template: [
                '<div class="view-source" ng-show="currentSource.source">',
                '<span class="btn btn-primary"><i class="icon-spinner icon-spin"></i><i class="icon-eye-open"></i> view source</span>',
                '</div>'
            ].join(''),
            link: function(scope, element, attrs) {

                element.bind('click', function(){

                    element.addClass('loading');

                    scope.lastOffset = $(window).scrollTop();

                    var highlight = "";
                    var glue = "";
                    for(var i=0; i < scope.currentSource.codeBlocks.length; i++) {
                        highlight = highlight + glue + scope.currentSource.codeBlocks[i].lineStart + '-' + scope.currentSource.codeBlocks[i].lineEnd;
                        glue = ",";
                    }

                    //let's determine if this is a doc file that doesn't need syntax highlighting
                    var language = "";
                    var contentURL = scope.currentSource.source.contentURL;
                    if(contentURL.indexOf('.doc.txt') != -1 || contentURL.indexOf('.ngdoc.txt') != -1 || contentURL.indexOf('.md.txt') != -1){
                        language = "lang-doc";
                    }

                    $.ajax({
                        url: scope.currentSource.source.contentURL,
                        success: function (content) {
                            var sourceContent = '<pre class="prettyprint linenums '+ language +'" prettyprint-highlight="'+highlight+'">' + content.replace(/\</gi,'&lt;').replace(/\>/gi,'&gt;') + '</pre>';
                            scope.lastMode = scope.mode;
                            scope.mode = "show-source";
                            scope.currentSourceContent = $compile( sourceContent )( scope );
                            scope.$apply();
                            element.removeClass('loading');
                        },
                        error: function () {
                            element.removeClass('loading');
                        }
                    });

                });
            }
        };
    }])
    .directive('prettyprintHighlight', function () {
        return {
            link: function(scope, element, attrs) {

                var listItems = element.find('li');

                var getBoundaries = function (bString) {

                    var highlight = function (bs, be) {

                        be = Math.min(be + 1, $(listItems).length);
                        if(be < $(listItems).length -1) {
                            be--;
                        }

                        for(var j=bs; j <= be; j++) {
                            $(listItems[j-1]).addClass('highlight');
                        }
                    };

                    var boundaries = bString.split(',');
                    for(var i=0; i < boundaries.length; i++) {

                        var thisB = boundaries[i];
                        var bParts = thisB.split('-');
                        if(bParts.length == 2){
                            highlight(parseInt(bParts[0]), parseInt(bParts[1]));
                        } else {
                            highlight(parseInt(bParts[0]), parseInt(bParts[0]));
                        }
                    }
                };

                getBoundaries(attrs.prettyprintHighlight);

                setTimeout(function(){
                    var first = $(element.find('li.highlight')[0]);
                    first.goTo();
                },1);
            }
        };
    })
    .directive('hideSource', function () {
        return {
            restrict: 'E',
            replace: true,
            template: [
                '<div class="view-source hide-source">',
                '<span class="btn source-file">',
                '<i class="icon-file"></i> <span class="source-url">{{currentSource.source.filename}}</span>',
                '<span class="btn btn-primary hide-source-btn" style="margin-left: 10px;"><i class="icon-eye-close"></i> hide source</span>',
                '</span>',
                '</div>'
            ].join(''),
            link: function(scope, element, attrs) {

                element.find('.hide-source-btn').bind('click', function(){
                    scope.mode = scope.lastMode;
                    scope.$apply();
                    setTimeout(function(){
                        $('html, body').animate({
                            scrollTop: scope.lastOffset + 'px'
                        }, 500);
                    },1);
                });
            }
        };
    })
    .directive('code', function () {
        return { restrict:'E', terminal: true };
    });