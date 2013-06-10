
/*============= THIS IS THE NAMESPACED API FOR EXTENDING THE MAIN MODULE FOR THE UI ============*/

var docsApp = docsApp || {};
docsApp.directive = docsApp.directive || {};
docsApp.controller = docsApp.controller || {};
docsApp.serviceFactory = docsApp.serviceFactory || {};


/*============= HERE WE EXTEND THE MAIN MODULE WITH SOME ANGULAR SPECIFIC DIRECTIVES ===========*/

docsApp.directive.sourceEdit = function(getEmbeddedTemplate) {
  return {
    template: '<div class="btn-group pull-right">' +
        '<a class="btn dropdown-toggle btn-primary" data-toggle="dropdown" href>' +
        '  <i class="icon-pencil icon-white"></i> Edit<span class="caret"></span>' +
        '</a>' +
        '<ul class="dropdown-menu">' +
        '  <li><a ng-click="plunkr($event)" href="">In Plunkr</a></li>' +
        '  <li><a ng-click="fiddle($event)" href="">In JsFiddle</a></li>' +
        '</ul>' +
        '</div>',
    scope: true,
    controller: function($scope, $attrs, openJsFiddle, openPlunkr) {
      var sources = {
        module: $attrs.sourceEdit,
        deps: read($attrs.sourceEditDeps),
        html: read($attrs.sourceEditHtml),
        css: read($attrs.sourceEditCss),
        js: read($attrs.sourceEditJs),
        unit: read($attrs.sourceEditUnit),
        scenario: read($attrs.sourceEditScenario)
      };
      $scope.fiddle = function(e) {
        e.stopPropagation();
        openJsFiddle(sources);
      };
      $scope.plunkr = function(e) {
        e.stopPropagation();
        openPlunkr(sources);
      };
    }
  }

  function read(text) {
    var files = [];
    angular.forEach(text ? text.split(' ') : [], function(refId) {
      // refId is index.html-343, so we need to strip the unique ID when exporting the name
      files.push({name: refId.replace(/-\d+$/, ''), content: getEmbeddedTemplate(refId)});
    });
    return files;
  }
};

docsApp.directive.docTutorialNav = function(templateMerge) {
  var pages = [
    '',
    'step_00', 'step_01', 'step_02', 'step_03', 'step_04',
    'step_05', 'step_06', 'step_07', 'step_08', 'step_09',
    'step_10', 'step_11', 'the_end'
  ];
  return {
    compile: function(element, attrs) {
      var seq = 1 * attrs.docTutorialNav,
          props = {
            seq: seq,
            prev: pages[seq],
            next: pages[2 + seq],
            diffLo: seq ? (seq - 1): '0~1',
            diffHi: seq
          };

      element.addClass('btn-group');
      element.addClass('tutorial-nav');
      element.append(templateMerge(
        '<li class="btn btn-primary"><a href="tutorial/{{prev}}"><i class="icon-step-backward"></i> Previous</a></li>\n' +
        '<li class="btn btn-primary"><a href="http://angular.github.com/angular-phonecat/step-{{seq}}/app"><i class="icon-play"></i> Live Demo</a></li>\n' +
        '<li class="btn btn-primary"><a href="https://github.com/angular/angular-phonecat/compare/step-{{diffLo}}...step-{{diffHi}}"><i class="icon-search"></i> Code Diff</a></li>\n' +
        '<li class="btn btn-primary"><a href="tutorial/{{next}}">Next <i class="icon-step-forward"></i></a></li>', props));
    }
  };
};

docsApp.directive.docTutorialReset = function() {
  function tab(name, command, id, step) {
    return '' +
      '  <div class=\'tab-pane well\' title="' + name + '" value="' + id + '">\n' +
      '    <ol>\n' +
      '      <li><p>Reset the workspace to step ' + step + '.</p>' +
      '        <pre>' + command + '</pre></li>\n' +
      '      <li><p>Refresh your browser or check the app out on <a href="http://angular.github.com/angular-phonecat/step-' + step + '/app">Angular\'s server</a>.</p></li>\n' +
      '    </ol>\n' +
      '  </div>\n';
  }

  return {
    compile: function(element, attrs) {
      var step = attrs.docTutorialReset;
      element.html(
        '<div ng-hide="show">' +
          '<p><a href="" ng-click="show=true;$event.stopPropagation()">Workspace Reset Instructions  ➤</a></p>' +
        '</div>\n' +
        '<div class="tabbable" ng-show="show" ng-model="$cookies.platformPreference">\n' +
          tab('Git on Mac/Linux', 'git checkout -f step-' + step, 'gitUnix', step) +
          tab('Git on Windows', 'git checkout -f step-' + step, 'gitWin', step) +
        '</div>\n');
    }
  };
};

docsApp.serviceFactory.openPlunkr = function(templateMerge, formPostData, angularUrls) {
  return function(content) {
    var allFiles = [].concat(content.js, content.css, content.html);
    var indexHtmlContent = '<!doctype html>\n' +
        '<html ng-app>\n' +
        '  <head>\n' +
        '    <script src="{{angularJSUrl}}"></script>\n' +
        '{{scriptDeps}}\n' +
        '  </head>\n' +
        '  <body>\n\n' +
        '{{indexContents}}' +
        '\n\n  </body>\n' +
        '</html>\n';
    var scriptDeps = '';
    angular.forEach(content.deps, function(file) {
      if (file.name !== 'angular.js') {
        scriptDeps += '    <script src="' + file.name + '"></script>\n'
      }
    });
    indexProp = {
      angularJSUrl: angularUrls['angular.js'],
      scriptDeps: scriptDeps,
      indexContents: content.html[0].content
    };
    var postData = {};
    angular.forEach(allFiles, function(file, index) {
      if (file.content && file.name != 'index.html') {
        postData['files[' + file.name + ']'] = file.content;
      }
    });

    postData['files[index.html]'] = templateMerge(indexHtmlContent, indexProp);
    postData['tags[]'] = "angularjs";

    postData.private = true;
    postData.description = 'AngularJS Example Plunkr';

    formPostData('http://plnkr.co/edit/?p=preview', postData);
  };
};

docsApp.serviceFactory.openJsFiddle = function(templateMerge, formPostData, angularUrls) {

  var HTML = '<div ng-app=\"{{module}}\">\n{{html:2}}</div>',
      CSS = '</style> <!-- Ugly Hack due to jsFiddle issue: http://goo.gl/BUfGZ --> \n' +
        '{{head:0}}<style>\n​.ng-invalid { border: 1px solid red; }​\n{{css}}',
      SCRIPT = '{{script}}',
      SCRIPT_CACHE = '\n\n<!-- {{name}} -->\n<script type="text/ng-template" id="{{name}}">\n{{content:2}}</script>';

  return function(content) {
    var prop = {
          module: content.module,
          html: '',
          css: '',
          script: ''
        };

    prop.head = templateMerge('<script src="{{url}}"></script>', {url: angularUrls['angular.js']});

    angular.forEach(content.html, function(file, index) {
      if (index) {
        prop.html += templateMerge(SCRIPT_CACHE, file);
      } else {
        prop.html += file.content;
      }
    });

    angular.forEach(content.js, function(file, index) {
      prop.script += file.content;
    });

    angular.forEach(content.css, function(file, index) {
      prop.css += file.content;
    });

    formPostData("http://jsfiddle.net/api/post/library/pure/", {
      title: 'AngularJS Example',
      html: templateMerge(HTML, prop),
      js: templateMerge(SCRIPT, prop),
      css: templateMerge(CSS, prop)
    });
  };
}; /*============= THIS IS THE NAMESPACED API FOR EXTENDING THE MAIN MODULE FOR THE UI ============*/

var docsApp = docsApp || {};
docsApp.directive = docsApp.directive || {};
docsApp.controller = docsApp.controller || {};
docsApp.serviceFactory = docsApp.serviceFactory || {};


/*============= HERE WE EXTEND THE MAIN MODULE WITH SOME ANGULAR SPECIFIC DIRECTIVES ===========*/

(function(){

    docsApp.directive.gitHubContributors = function($timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: [
                '<div>',
                    '<ul class="github-contributors">',
                        '<li ng-repeat="contributor in contributors">',
                            '<span class="github-contributors-photo"><img src="{{contributor.avatar_url}}"/></span>',
                            '<span class="github-contributors-info"><a href="{{contributor.html_url}}">{{contributor.login}}</a></span>',
                        '</li>',
                    '</ul>',
                '</div>'
            ].join(''),
            link: function(scope, element, attrs) {

                var sortByContributions = function (a, b) {
                    if(a.contributions < b.contributions) {
                        return 1;
                    } else if (a.contributions > b.contributions){
                        return -1;
                    } else {
                        return 0;
                    }
                };

                if(attrs.owner && attrs.repo){

                    var requestURL = 'controller/github/repos/'+attrs.owner+'/'+attrs.repo+'/contributors';

                    $.ajax({
                        dataType: "json",
                        url: requestURL,
                        cache: false,
                        success: function(data) {
                            data.sort(sortByContributions);
                            scope.contributors = data;
                            scope.$apply();
                        }
                    });
                }
            }
        };
    };

    docsApp.directive.gitHubIssues = function($timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: [
                '<div>',
                    '<ol class="github-issues">',
                        '<li ng-repeat="issue in issues | orderBy:predicate:reverse" ng-class="stateClass(issue)">',
                            '<span class="github-issue-name"><i ng-class="iconClass(issue)"></i> <a href="{{issue.html_url}}" target="_blank">{{issue.title}} </a></span>',
                        '</li>',
                    '</ol>',
                '</div>'
            ].join(''),
            link: function(scope, element, attrs) {

                scope.iconClass = function (issue) {
                    return {
                        'icon-check-empty': issue.state == "open",
                        'icon-check': issue.state == "closed"
                    };
                };

                scope.stateClass = function (issue) {
                    return {
                        'github-issue-closed': issue.state == "closed",
                        'github-issue-open': issue.state == "open"
                    };
                };

                var orderByString = attrs.orderBy || "state";
                var orderByParams = orderByString.split(':');
                scope.predicate = orderByParams[0];
                scope.reverse = orderByParams.length > 0 ? orderByParams[1] : 'false';

                attrs.labels = attrs.labels || "";
                var labels = attrs.labels.split(',');

                var sortBySomething = function (a, b) {
                    if(a.contributions < b.contributions) {
                        return 1;
                    } else if (a.contributions > b.contributions){
                        return -1;
                    } else {
                        return 0;
                    }
                };

                if(attrs.owner && attrs.repo){

                    var requestURL = 'controller/github/repos/'+attrs.owner+'/'+attrs.repo+'/issues';

                    var urlGlue = "?";

                    if(labels.length > 0){

                        var labelParams = urlGlue + "labels=";
                        urlGlue = "&";

                        var glue = "";
                        for(var i=0; i < labels.length; i++) {
                            labelParams = labelParams + glue + labels[i];
                            glue = "%2C";
                        }

                        requestURL = requestURL + labelParams;
                    }

                    var allIssues = [];
                    var finished = 0;
                    var loadData = function () {
                        finished = finished + 1;
                        if(finished == 2){
                            scope.issues = allIssues;
                            scope.$apply();
                        }
                    };

                    $.ajax({
                        dataType: "json",
                        url: requestURL + urlGlue + "state=open",
                        cache: false,
                        success: function(data) {
                            allIssues = allIssues.concat(data);
                            loadData();
                        }
                    });

                    $.ajax({
                        dataType: "json",
                        url: requestURL + urlGlue + "state=closed",
                        cache: false,
                        success: function(data) {
                            allIssues = allIssues.concat(data);
                            loadData();
                        }
                    });
                }

            }
        };
    };

})();


 