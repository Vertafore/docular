angular.module('docular.services', [])
    .factory('angularUrls', ['$document', function ($document) {
        var urls = {};

        angular.forEach($document.find('script'), function(script) {
            var match = script.src.match(/^.*\/(angular[^\/]*\.js)$/);
            if (match) {
                urls[match[1].replace(/(\-\d.*)?(\.min)?\.js$/, '.js')] = match[0];
            }
        });

        return urls;
    }])
    .value('LanguageFileSuffixes', {
        css: 'css',
        js: 'javascript',
        php: 'php',
        java: 'java',
        rb: 'ruby',
        xml: 'xml',
        html: 'xml',
        tpl: 'xml',
        scss: 'scss'
    })
    .factory('formPostData', ['$document', function ($document) {
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
    }])
    .factory('sections', function () {
        var sections = {
            pages : {},
            groupMap : {},
            getPage: function(groupId, sectionId, partialId) {
                console.log(arguments)
                if(sectionId && partialId){

                    var pages = sections.pages[groupId][sectionId];
                    for (var i = 0, ii = pages.length; i < ii; i++) {
                        if (pages[i].id == partialId) {
                            return pages[i];
                        }
                    }

                } else {

                    var pages = sections.pages[groupId][sectionId];
                    for (var i = 0, ii = pages.length; i < ii; i++) {
                        if (pages[i].id == 'index') {
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
                    sections.groupMap[group.groupId] = {groupTitle:group.groupTitle, sections:{}, groupIcon:group.groupIcon, visible: group.visible};

                    var sects = group.sections;
                    for(var k=0; k < sects.length; k++) {
                        sects[k].url = (window.useHtml5Mode ? '' : '#') + 'documentation/' + group.groupId + '/' + sects[k].id + '/index';
                        sections.groupMap[group.groupId].sections[sects[k].id] = sects[k];
                    }

                    groups.push({
                        id: group.groupId,
                        title: group.groupTitle,
                        groupIcon: group.groupIcon || 'icon-book',
                        sections: sects,
                        visible: group.visible
                    });
                }

                return groups;
            }
        };

        angular.forEach(DOC_DATA, function(page) {

            page.url = (window.useHtml5Mode ? '' : '#') + "documentation/" + page.group + "/" + page.section + '/' +  page.id;
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
    })
    .factory('contentLoading', function () {
        var loadingTimeout;
        var status = false;

        var endLoading = function (callbaack) {
            clearTimeout(loadingTimeout);
            status = false;
            return status;
        };

        var loading = {
            startLoading : function (callBack) {
                status = true;
                loadingTimeout = setTimeout(endLoading, 1000);
                return status;
            },
            endLoading: function (callBack) {
                return endLoading(callBack);
            }
        };

        return loading;
    })