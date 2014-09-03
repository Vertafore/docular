angular.module('docApi.directives', [])
	.directive('sourceEdit', ['getEmbeddedTemplate', function (getEmbeddedTemplate) {
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
	  }])
	  .directive('docTutorialNav', ['templateMerge', function (templateMerge) {
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
	  }])
	  .directive('docTutorialReset', function () {
		function tab(name, command, id, step) {
			return '' +
			  '  <tab class=\'well\' title="' + name + '" value="' + id + '">\n' +
			  '    <ol>\n' +
			  '      <li><p>Reset the workspace to step ' + step + '.</p>' +
			  '        <pre>' + command + '</pre></li>\n' +
			  '      <li><p>Refresh your browser or check the app out on <a href="http://angular.github.com/angular-phonecat/step-' + step + '/app">Angular\'s server</a>.</p></li>\n' +
			  '    </ol>\n' +
			  '  </tab>\n';
			}

			return {
			compile: function(element, attrs) {
			  var step = attrs.docTutorialReset;
			  element.html(
				'<div ng-hide="show">' +
				  '<p><a href="" ng-click="show=true;$event.stopPropagation()">Workspace Reset Instructions  ?</a></p>' +
				'</div>\n' +
				'<tabset ng-show="show" ng-model="$cookies.platformPreference">\n' +
				  tab('Git on Mac/Linux', 'git checkout -f step-' + step, 'gitUnix', step) +
				  tab('Git on Windows', 'git checkout -f step-' + step, 'gitWin', step) +
				'</tabset>\n');
			}
		};
	  });