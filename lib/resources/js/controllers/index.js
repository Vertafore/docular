
angular.module('docular.controllers', [
    'docular.services',
    'docular.directives'
])
    .controller('HomepageController', ['$scope', function () {

    }])
    .controller('GroupIndexController', ['$scope', '$route', 'sections', function ($scope, $route, sections) {
        $scope.groupId = $route.current.params.group;
        $scope.group = sections.groupMap[$scope.groupId];
        $scope.mainpage.partialTitle = $scope.group.groupTitle;
    }])
    .controller('DocumentationPageController', ['$scope', '$route', 'sections', '$location', function ($scope, $route, sections, $location) {
        var groupId = $route.current.params.group,
            sectionId = $route.current.params.section,
            partialId = $route.current.params.partial;


        function mergePaths(path1, path2){
            //make sure not to create a double slash
            var path = angular.copy(path1);
            if (path1[path1.length-1] === '/' && path2[0] === '/' ){
                path = path1.slice(0, path1.length-1);
            }
            return path + path2;
        }

        $scope.showSourceCode = function () {
            if($scope.showSource) { $scope.showSource = false; return; }

            //let's determine if this is a doc file that doesn't need syntax highlighting
            var contentURL = $scope.currentSource.source.contentURL;
            console.log(contentURL);
            $.ajax({
                url: mergePaths((baseURL || ''), $scope.currentSource.source.contentURL),
                success: function (content) {
                    var fileType = contentURL.match(/\.([a-zA-Z0-9]+)\.txt$/)[1];
                    $scope.source = content;
                    $scope.fileType = fileType;
                    $scope.showSource = true;

                }
            });
        };

        $scope.updateSearch(groupId, sectionId, partialId);
        var page = sections.getPage(groupId, sectionId, partialId);
        var groupTitle = groupId ? sections.groupMap[groupId].groupTitle : "";
        var sectionName = sectionId ? sections.groupMap[groupId].sections[sectionId].title : "";

        if(page) {
            $scope.currentSource = {
                source: page.source,
                codeBlocks: page.codeBlocks
            };
            $scope.mainpage.partialTitle = page.shortName;
            $scope.page = page;
        } else if(partialId && partialId !== 'index') {
            $location.path('/404');
            $location.replace();
        } else {
            $scope.mainpage.partialTitle = 'Index';
        }


        $scope.$watch('search.value', function () {
            $scope.updateSearch(groupId, sectionId, partialId);
        });

        //lets expose additional data into the $scope so extensions can take advanatage of it
        $scope.sectionInfo = sections.groupMap[groupId].sections[sectionId];
        var pageOrder = $scope.sectionInfo.rank || {};
        $scope.sectionPages = $scope.sortPages(sections.pages[groupId][sectionId], pageOrder);

        var currentPageId = $location.path();
        if($scope.discussionsEnabled){
            $scope.loadDisqus(currentPageId);
        }

        // Update breadcrumbs
        var breadcrumb = $scope.breadcrumb = [];

        if (partialId) {

            breadcrumb.push({ name: groupTitle, url:(window.useHtml5Mode ? '' : '#') + 'documentation/' + groupId + '/index'});
            if(partialId != 'index') {
                breadcrumb.push({ name: sectionName, url: (window.useHtml5Mode ? '' : '#') + 'documentation/' + groupId + '/' + sectionId + '/index' });
            } else {
                breadcrumb.push({ name: sectionName });
            }

            if(page && page.module && page.docType != "overview" && partialId != 'index'){

                if(page.moduleItem){

                    breadcrumb.push({ name: page.module, url: (window.useHtml5Mode ? '' : '#') + 'documentation/' + groupId + '/' + sectionId + '/' + page.module});

                    if(page.moduleSubItem){

                        breadcrumb.push({ name: page.moduleItem, url: (window.useHtml5Mode ? '' : '#') + 'documentation/' + groupId + '/' + sectionId + '/' + page.module + '.' + page.moduleSection + ':' + page.moduleItem});
                        breadcrumb.push({ name: page.moduleSubItem});

                    } else {

                        breadcrumb.push({ name: page.moduleItem});
                    }
                } else {

                    breadcrumb.push({ name: page.module});
                }
            } else if (partialId != 'index'){

                if(page) {
                    breadcrumb.push({ name: page.shortName });
                }
            }

        } else if (sectionId) {

            breadcrumb.push({ name: groupTitle, url:(window.useHtml5Mode ? '' : '#') + 'documentation/' + groupId + '/index'});
            breadcrumb.push({ name: sectionName });

        } else if (groupId) {

            breadcrumb.push({ name: groupTitle, url:(window.useHtml5Mode ? '' : '#') + 'documentation/' + groupId + '/index'});

        }
    }])
    .controller('DocsController', [
        '$scope', '$location', '$window', '$cookies', 'sections', 'contentLoading',
        function ($scope, $location, $window, $cookies, sections, contentLoading) {

            var OFFLINE_COOKIE_NAME = 'ng-offline';
            var DOCS_PATH = /^\/(documentation)/;
            var HOME_PATH = /^\/$/;
            var INDEX_PATH = /^(\/|\/index[^\.]*.html)$/;
            var GLOBALS = /^angular\.([^\.]+)$/;
            var MODULE = /^((?:(?!^angular\.)[^\.])+)$/;
            var MODULE_MOCK = /^angular\.mock\.([^\.]+)$/;
            var MODULE_DIRECTIVE = /^((?:(?!^angular\.)[^\.])+)\.directive:([^\.]+)$/;
            var MODULE_DIRECTIVE_INPUT = /^((?:(?!^angular\.)[^\.])+)\.directive:input\.([^\.]+)$/;
            var MODULE_FILTER = /^((?:(?!^angular\.)[^\.])+)\.filter:([^\.]+)$/;
            var MODULE_SERVICE = /^((?:(?!^angular\.)[^\.])+)\.([^\.]+?)(Provider)?$/;
            var MODULE_TYPE = /^((?:(?!^angular\.)[^\.])+)\..+\.([A-Z][^\.]+)$/;

            var URL = {
                module: 'guide/module',
                directive: 'guide/directive',
                input: 'documentation/angular/api/ng.directive:input',
                filter: 'guide/dev_guide.templates.filters',
                service: 'guide/dev_guide.services',
                type: 'guide/types'
            };

            var pageMatches = function (p1, p2) {
                return p1 && p2 && (p1.section == p2.section && p1.group == p2.group && p1.id == p2.id);
            };

            /*=========== PUBLIC METHODS =============*/

            $scope.loadingClass = function () {
                return {
                    'documentation-loading' : $scope.loading
                };
            };

            $scope.navClass = function(page) {
                return {
                    last: this.$last,
                    active: page && pageMatches(this.currentPage, page)
                };
            };

            $scope.iconClass = function(module) {
                return {
                    'icon-plus': module.visible === "hidden",
                    'icon-minus': module.visible !== "hidden"
                };
            };

            $scope.visibilityClass = function(module) {
                return {
                    'hidden': module.visible === "hidden",
                    'btn-primary': module.selected && module.visible === "hidden"
                };
            };

            $scope.toggleVisible = function () {

                var visibilityCookie = this.module.placement.group + "-" + this.module.placement.section + "-" + this.module.placement.module + ".visible";
                this.module.visible = (this.module.visible === "visible") ? "hidden" : "visible";

                $.cookie(
                    visibilityCookie,
                    this.module.visible
                );
            };

            $scope.submitForm = function() {
                $scope.bestMatch && $location.path($scope.bestMatch.page.url);
            };

            $scope.afterPartialLoaded = function() {

                var currentPageId = $location.path();
                $scope.mainpage.partialTitle = $scope.currentPage.shortName;
                $window._gaq.push(['_trackPageview', currentPageId]);

                $scope.loading = contentLoading.endLoading();
            };

            /** stores a cookie that is used by apache to decide which manifest ot send */
            $scope.enableOffline = function() {
                //The cookie will be good for one year!
                var date = new Date();
                date.setTime(date.getTime()+(365*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
                var value = angular.version.full;
                document.cookie = OFFLINE_COOKIE_NAME + "="+value+expires+"; path=" + $location.path;

                //force the page to reload so server can serve new manifest file
                window.location.reload(true);
            };

            //get all possible document groups
            $scope.docGroups = sections.getGroups();
            console.log($scope.docGroups);

            //the default mode

            /*============ WATCHES ============*/

            /*$scope.$watch(function docsPathWatch() { return $location.path(); }, function docsPathWatchAction(path) {

                //reset a view variables
                $scope.currentSource = false;

                //we are loading something
                $scope.loading = contentLoading.startLoading();
            });*/
			$scope.search = {};


            /*=========== INITIALIZE ===========*/
            $scope.mainpage = {
                partialTitle: "Home"
            };
            $scope.versionNumber = angular.version.full;
            $scope.version = angular.version.full + "  " + angular.version.codeName;
            $scope.subpage = false;
            $scope.offlineEnabled = ($cookies[OFFLINE_COOKIE_NAME] == angular.version.full);
            $scope.futurePartialTitle = null;
            $scope.loading = 0;
            $scope.URL = URL;
            $scope.$cookies = $cookies;
            $scope.discussionsEnabled = discussionConfigs.active;

            $cookies.platformPreference = $cookies.platformPreference || 'gitUnix';

            // bind escape to hash reset callback
            angular.element(window).bind('keydown', function(e) {
                if (e.keyCode === 27) {
                    $scope.$apply(function() {
                        $scope.subpage = false;
                    });
                }
            });

            var moduleSectionInfoMap = {};
            for(var m=0; m < GROUP_DATA.length; m++){

                var thisGroup = GROUP_DATA[m];
                var group = thisGroup.groupId;

                moduleSectionInfoMap[group] = {};
                console.log(group);
                for(var l=0; l < thisGroup.sections.length; l++){

                    var thisSection = thisGroup.sections[l];
                    var thisDocAPI = thisSection['doc_api'];
                    //if there are no docs for this section then the doc_api value will be empty and this is pointless
                    if(thisDocAPI){
                        moduleSectionInfoMap[group][thisSection.id] = {};

                        //first check for a link to the definition of "module"
                        moduleSectionInfoMap[group][thisSection.id]["module"] = {link:LAYOUT_DATA[thisDocAPI].layout.module.link || "#"};

                        //next look for links for the definition of each "section" (they can be absoulte or relative to the root of the webapp)
                        for(var modSection in LAYOUT_DATA[thisDocAPI].layout.sections){
                            moduleSectionInfoMap[group][thisSection.id][modSection] = {};
                            moduleSectionInfoMap[group][thisSection.id][modSection].link = LAYOUT_DATA[thisDocAPI].layout.sections[modSection].link || "#";
                            moduleSectionInfoMap[group][thisSection.id][modSection].order = LAYOUT_DATA[thisDocAPI].layout.sections[modSection].order || 99999999;
                        }
                    }

                }
            }


            /*========== PRIVATE METHODS ============*/

            window.moduleSectionInfoMap = moduleSectionInfoMap;

            function sortPages (pages, pageOrder) {

                pageOrder = pageOrder || {};

                var PAGE_SORT = function (p1, p2) {

                    if(p1.id == "index") {
                        return 1;
                    }

                    if(p2.id == "index") {
                        return -1;
                    }

                    var p1_rank = pageOrder[p1.id];
                    var p2_rank = pageOrder[p2.id];

                    if( (p1_rank && !p2_rank) || (p1_rank && p1_rank < p2_rank) ){
                        return -1;
                    } else if ( (p2_rank && !p1_rank) || (p2_rank && p2_rank < p1_rank) ) {
                        return 1;
                    } else if (p1_rank && p2_rank){

                        if(p1_rank < p2_rank) {
                            return -1;
                        } else if (p2_rank < p1_rank) {
                            return 1;
                        } else {
                            return 0;
                        }

                    } else {

                        if(p1.shortName < p2.shortName) {
                            return -1;
                        } else if (p2.shortName < p1.shortName) {
                            return 1;
                        } else {
                            return 0;
                        }

                    }
                };

                return pages.sort(PAGE_SORT);
            }
            $scope.sortPages = sortPages;
            function getModuleSectionLink(page, modSection) {
                var link = (moduleSectionInfoMap[page.group][page.section][modSection] ?
                    moduleSectionInfoMap[page.group][page.section][modSection].link : '#');
                if(link !== '#' && !useHtml5Mode) {
                    link = '#' + link;
                }
                return link;
            }
            function getModuleSectionOrder(page, modSection) {
                return moduleSectionInfoMap[page.group][page.section][modSection] ?
                    moduleSectionInfoMap[page.group][page.section][modSection].order : 9999;
            }

            function getVisibility(pGroup, pSection, pModule) {

                //first determine if it is visible
                var visibleCookie = pGroup + "-" + pSection + "-" + pModule + ".visible";

                var visible = $.cookie(visibleCookie);
                if(!visible){
                    visible = 'visible';
                    $.cookie(visibleCookie, "visible");
                }

                var selected = false;
                if($scope.currentPage){
                    //then determine if this module is the one who's item is selected
                    var currentVis = $scope.currentPage.group + "-" + $scope.currentPage.section + "-" + $scope.currentPage.module;
                    if(currentVis === pGroup + "-" + pSection + "-" + pModule){
                        selected = true;
                    }
                }

                return {visible:visible, selected:selected};
            }

            function updateSearch(groupId, sectionId, partialId) {

                var modules = $scope.modules = [],
                    otherPages = $scope.pages = [],
                    search = $scope.search.value,
                    bestMatch = {page: null, rank:0};

                if(!sectionId){
                    return;
                }

                var MODULE_SORT = function (a, b) {
                    if(a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                };

                var pageOrder = sections.groupMap[groupId].sections[sectionId].rank || {};

                var cache = {};
                var pages = sortPages(sections.pages[groupId][sectionId], pageOrder);

                angular.forEach(pages, function(page) {
                    var match,
                        id = page.id;

                    if (!(match = rank(page, search))) return;

                    if (match.rank > bestMatch.rank) {
                        bestMatch = match;
                    }


                    /*============ HERE WE GENERATE NEW MODULES AND PUSH PAGES INTO DIFFERENT SECTIONS OF EACH MODULE ===========*/

                    //if this docType is "overview", then it doesn't go in a module
                    if (page.docType == 'overview' && page.id != 'index') {

                        otherPages.push(page);

                        //otherwise, everything else should be in a module except for index.html files which match to the section description
                    } else if( page.id != 'index') {

                        //if there is no module section, then it's a module definition
                        if(!page.moduleSection){
                            module(page.module, page).definition = page;
                        } else {
                            module(page.module, page).section(page);
                        }
                    }

                });

                //sort the modules
                modules.sort(MODULE_SORT);

                //set the best match
                $scope.bestMatch = bestMatch;


                //============= HELPER METHODS

                function module(name, page) {
                    var module = cache[name];
                    if (!module) {
                        var visibility = getVisibility(page.group, page.section, page.module);

                        module = cache[name] = {
                            name: name,
                            placement: {group: page.group, section: page.section, module: page.module},
                            visible: visibility.visible,
                            selected: visibility.selected,
                            guideURL: getModuleSectionLink(page, 'module'),
                            codeURL: (useHtml5Mode ? '': '#') + 'documentation/' + page.group + '/' + page.section + '/' + page.module,
                            definition: false,
                            sections: [],
                            sectionsMap: {},
                            section: function(page) {
                                if(this.sectionsMap[page.moduleSection] === undefined){
                                    this.sectionsMap[page.moduleSection] = this.sections.length;
                                    this.sections.push({
                                        order: getModuleSectionOrder(page, page.moduleSection),
                                        name: page.moduleSection,
                                        link: getModuleSectionLink(page, page.moduleSection),
                                        pages: []
                                    });
                                }
                                this.sections[this.sectionsMap[page.moduleSection]].pages.push(page);
                            },
                            parseService: function(name) {
                                var service =  cache[this.name + ':' + name];
                                if (!service) {
                                    service = {name: name};
                                    cache[this.name + ':' + name] = service;
                                    this.service.push(service);
                                }
                                return service;
                            }
                        };
                        modules.push(module);
                    }
                    return module;
                }

                function rank(page, terms) {
                    var ranking = {page: page, rank:0},
                        keywords = page.keywords,
                        title = page.shortName.toLowerCase();

                    terms && angular.forEach(terms.toLowerCase().split(' '), function(term) {
                        var index;

                        if (ranking) {
                            if (keywords.indexOf(term) == -1) {
                                ranking = null;
                            } else {
                                ranking.rank ++; // one point for each term found
                                if ((index = title.indexOf(term)) != -1) {
                                    ranking.rank += 20 - index; // ten points if you match title
                                }
                            }
                        }
                    });
                    return ranking;
                }
                console.log(otherPages)
            }
            $scope.updateSearch = updateSearch;
            function unLoadDisqus () {
                angular.element(document.getElementById('disqus_thread')).html('');
            }

            function loadDisqus(currentPageId) {

                // http://docs.disqus.com/help/2/
                window.disqus_shortname = discussionConfigs.shortName;
                window.disqus_identifier = currentPageId;
                window.disqus_url = discussionConfigs.url + currentPageId;

                if ($location.host() == 'localhost' || discussionConfigs.dev) {
                    window.disqus_developer = 1;
                }

                // http://docs.disqus.com/developers/universal/
                (function() {
                    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                    dsq.src = 'http://angularjs.disqus.com/embed.js';
                    (document.getElementsByTagName('head')[0] ||
                        document.getElementsByTagName('body')[0]).appendChild(dsq);
                })();

                unLoadDisqus();
            }
            $scope.loadDisqus = loadDisqus;


        }]);
