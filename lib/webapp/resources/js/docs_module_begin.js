
/*============ CREATE OBJECT TO STORE ALL THE DOCSAPP MODULE CONFIGS ============*/

var docsApp = {
    controller: {},
    directive: {},
    serviceFactory: {}
};


/*============ CONTROLLER DIRECTIVES AND SERVICES ============*/

docsApp.directive.focused = function($timeout) {
  return function(scope, element, attrs) {
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
  };
};

docsApp.directive.code = function() {
  return { restrict:'E', terminal: true };
};

docsApp.serviceFactory.angularUrls = function($document) {
  var urls = {};

  angular.forEach($document.find('script'), function(script) {
    var match = script.src.match(/^.*\/(angular[^\/]*\.js)$/);
    if (match) {
      urls[match[1].replace(/(\-\d.*)?(\.min)?\.js$/, '.js')] = match[0];
    }
  });

  return urls;
};

docsApp.serviceFactory.formPostData = function($document) {
  return function(url, fields) {
    var form = angular.element('<form style="display: none;" method="post" action="' + url + '" target="_blank"></form>');
    angular.forEach(fields, function(value, name) {
      var input = angular.element('<input type="hidden" name="' +  name + '">');
      input.attr('value', value);
      form.append(input);
    });
    $document.find('body').append(form);
    form[0].submit();
    form.remove();
  };
};

docsApp.serviceFactory.sections = function sections() {

    var sections = {
        pages : {},
        groupMap : {},
        getPage: function(groupId, sectionId, partialId) {

            if(sectionId && partialId){
                var pages = sections.pages[groupId][sectionId];

                for (var i = 0, ii = pages.length; i < ii; i++) {
                    if (pages[i].id == partialId) {
                        return pages[i];
                    }
                }
            }

            return null;
        },
        getGroups : function () {

            sections.groupMap = {};

            var groups = [];
            for(var j=0; j < GROUP_DATA.length; j++){

                var group = GROUP_DATA[j];

                sections.groupMap[group.groupId] = {groupTitle:group.groupTitle, sections:{}};

                var sects = group.sections;
                for(var k=0; k < sects.length; k++) {
                    sects[k].url = 'documentation/' + group.groupId + '/' + sects[k].id + '/index';
                    sections.groupMap[group.groupId].sections[sects[k].id] = sects[k];
                }

                groups.push({
                    title: group.groupTitle,
                    groupIcon: group.groupIcon || 'icon-book',
                    sections: sects
                });
            }
            return groups;
        }
    };

    angular.forEach(DOC_DATA, function(page) {

        page.url = "documentation/" + page.group + "/" + page.section + '/' +  page.id;
        page.partialUrl = 'documentation/partials/' + page.group + '/' + page.section + '/' +  page.id + '.html';

        //make sure the group is defined
        if(!sections.pages[page.group]){
            sections.pages[page.group] = [];
        }

        if(!sections.pages[page.group][page.section]){
            sections.pages[page.group][page.section] = [];
        }
        sections.pages[page.group][page.section].push(page);
    });

    return sections;
};


/*=========== THIS IS THE MAIN CONTROLLER FOR THE DOCUMENTATION RENDERING WORKFLOW ============*/

docsApp.controller.DocsController = function($scope, $location, $window, $cookies, sections) {

    var OFFLINE_COOKIE_NAME = 'ng-offline';
    var DOCS_PATH = /^\/(documentation)/;
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

    $scope.toggleVisible = function (e) {

        if(this.module.visible === "visible"){
            this.module.visible = "hidden";
            $.cookie(this.module.definition.group + "-" + this.module.definition.section + "-" + this.module.definition.module + ".visible",'hidden');
        } else {
            this.module.visible = "visible";
            $.cookie(this.module.definition.group + "-" + this.module.definition.section + "-" + this.module.definition.module + ".visible",'visible');
        }
    };

    $scope.submitForm = function() {
        $scope.bestMatch && $location.path($scope.bestMatch.page.url);
    };

    $scope.afterPartialLoaded = function() {
        var currentPageId = $location.path();
        $scope.partialTitle = $scope.currentPage.shortName;
        $window._gaq.push(['_trackPageview', currentPageId]);
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


    /*============ WATCHES ============*/

    $scope.$watch(function docsPathWatch() {return $location.path(); }, function docsPathWatchAction(path) {

        // ignore non-doc links which are used in examples
        if (DOCS_PATH.test(path)) {
            var parts = path.split('/'),
                groupId = parts[2],
                sectionId = parts[3],
                partialId = parts[4];

            var page = sections.getPage(groupId, sectionId, partialId);
            var groupTitle = groupId ? sections.groupMap[groupId].groupTitle : "";
            var sectionName = sectionId ? sections.groupMap[groupId].sections[sectionId].title : "";

            $scope.currentPage = page;

            if (!$scope.currentPage) {
                $scope.partialTitle = 'Error: Page Not Found!';
            }

            var currentPageId = $location.path();
            loadDisqus(currentPageId);

            updateSearch();


            // Update breadcrumbs
            var breadcrumb = $scope.breadcrumb = [],
                match;

            if (partialId) {
                breadcrumb.push({ name: "Documentation", url: 'documentation' });
                breadcrumb.push({ name: groupTitle, url: 'documentation/' + groupId });
                breadcrumb.push({ name: sectionName, url: 'documentation/' + groupId + '/' + sectionId });

                if(page && page.module && page.docType != "overview"){

                    if(page.moduleItem){

                        breadcrumb.push({ name: page.module, url: 'documentation/' + groupId + '/' + sectionId + '/' + page.module});

                        if(page.moduleSubItem){

                            breadcrumb.push({ name: page.moduleItem, url: 'documentation/' + groupId + '/' + sectionId + '/' + page.module + '.' + page.moduleSection + ':' + page.moduleItem});
                            breadcrumb.push({ name: page.moduleSubItem});

                        } else {

                            breadcrumb.push({ name: page.moduleItem});
                        }
                    } else {

                        breadcrumb.push({ name: page.module});
                    }
                } else {

                    if(page) {
                        breadcrumb.push({ name: page.shortName });
                    }
                }

            } else if (sectionId) {

                breadcrumb.push({ name: "Documentation", url: 'documentation' });
                breadcrumb.push({ name: groupTitle, url: 'documentation/' + groupId });
                breadcrumb.push({ name: sectionName });

            } else if (groupId) {

                breadcrumb.push({ name: "Documentation", url: 'documentation' });
                breadcrumb.push({ name: groupTitle, url: 'documentation/' + groupId });

            }
        }
    });

    $scope.$watch('search', updateSearch);


    /*=========== INITIALIZE ===========*/

    $scope.versionNumber = angular.version.full;
    $scope.version = angular.version.full + "  " + angular.version.codeName;
    $scope.subpage = false;
    $scope.offlineEnabled = ($cookies[OFFLINE_COOKIE_NAME] == angular.version.full);
    $scope.futurePartialTitle = null;
    $scope.loading = 0;
    $scope.URL = URL;
    $scope.$cookies = $cookies;

    $cookies.platformPreference = $cookies.platformPreference || 'gitUnix';

    if (!$location.path() || INDEX_PATH.test($location.path())) {
        $location.path('/').replace();
    }
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

    function getModuleSectionLink(page, modSection) {
        return moduleSectionInfoMap[page.group][page.section][modSection].link;
    }
    function getModuleSectionOrder(page, modSection) {
        return moduleSectionInfoMap[page.group][page.section][modSection].order;
    }

    function getVisibility(pGroup, pSection, pModule) {

        var currentVis = $scope.currentPage.group + "-" + $scope.currentPage.section + "-" + $scope.currentPage.module;

        if(currentVis !== pGroup + "-" + pSection + "-" + pModule){
            if($.cookie(pGroup + "-" + pSection + "-" + pModule + ".visible")){
                return $.cookie(pGroup + "-" + pSection + "-" + pModule + ".visible");
            } else {
                $.cookie(pGroup + "-" + pSection + "-" + pModule + ".visible", "visible");
                return $.cookie(pGroup + "-" + pSection + "-" + pModule + ".visible");
            }
        } else {
            return "force-open";
        }
    }

    function updateSearch() {

        var parts = $location.path().split('/');
        var modules = $scope.modules = [],
        otherPages = $scope.pages = [],
        search = $scope.search,
        bestMatch = {page: null, rank:0};

        if(!parts[3]){
            return;
        }

        var cache = {};
        var pages = sections.pages[parts[2]][parts[3]];


        angular.forEach(pages, function(page) {
            var match,
            id = page.id;

            if (!(match = rank(page, search))) return;

            if (match.rank > bestMatch.rank) {
                bestMatch = match;
            }


            /*============HERE WE GENERATE NEW MODULES AND PUSH PAGES INTO DIFFERENT SECTIONS OF EACH MODULE ===========*/

            //if this docType is "overview", then it doesn't go in a module
            if (page.docType == 'overview') {

                otherPages.push(page);

            //otherwise, everything else should be in a module
            } else {

                //if there is no module section, then it's a module definition
                if(!page.moduleSection){
                    module(page.module, page).definition = page;
                } else {
                    module(page.module, page).section(page);
                }
            }

        });

        $scope.bestMatch = bestMatch;

        //============= HELPER METHODS

        function module(name, page) {
            var module = cache[name];
            if (!module) {
                module = cache[name] = {
                    name: name,
                    visible: getVisibility(page.group, page.section, page.module),
                    guideURL: getModuleSectionLink(page, 'module'),
                    codeURL: 'documentation/' + page.group + '/' + page.section + '/' + page.module,
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
    }

    function unLoadDisqus () {
        angular.element(document.getElementById('disqus_thread')).html('');
    }

    function loadDisqus(currentPageId) {
        // http://docs.disqus.com/help/2/
        window.disqus_shortname = 'johndavidfive';
        window.disqus_identifier = currentPageId;
        window.disqus_url = 'http://johndavidfive.com' + currentPageId;

        if ($location.host() == 'localhost') {
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

}; //end : controller definition