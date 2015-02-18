angular.module('docular.services', [])
    .service('markdown', function () {
        
        var renderer = new marked.Renderer();
        renderer.code = function (code, lang) {
            var viewer = '<source-viewer file-type="' + lang + '">'+$("<div>").text(code).html()+'</source-viewer>';
            return viewer;
        };
        
        return function (raw, options) {
            if(!options) { options = {}; }
            if(!options.renderer) { options.renderer = renderer; }
            return marked(raw, options);
        };
    })
    .provider('pageData', function () {
        var pageAttrs = {
            title: null
        };
        this.$get = [function () {
            return pageAttrs;
        }];
    })
    .service('source', ['$http', '$q', function ($http, $q) {
        return {
            fetchSourceFile: function (file) {
                return $http.get('sources/' + file);
            }
        }
    }])
    .service('dataFilter', function () {
        return function (searchIn, params) {
            var results = [];
            var keys = [], key;
            for(key in params) {
                keys.push(key);
            }

            for(var i = 0, l = searchIn.length; i < l; i++) {
                var found = true, doc = searchIn[i];
                for(var ki = 0, kl = keys.length; ki < kl && found; ki++) {
                    key = keys[ki];
                    var docSearchCol = doc[key];
                    if(typeof docSearchCol === 'object') {
                        if(docSearchCol instanceof Array) {
                            docSearchCol = docSearchCol.join('\n');
                        }
                    }
                    if(typeof params[key] === 'object') {
                        switch(params[key].op) {
                            case 'like': 
                                if(doc[key]) {
                                    found = docSearchCol.indexOf(params[key].val) != -1
                                } else {
                                    found = false;
                                }
                            break;
                            case 'ilike': 
                                if(doc[key]) {
                                    found = ("" + docSearchCol).toLowerCase().indexOf(params[key].val) != -1
                                } else {
                                    found = false;
                                }
                            break;
                            case 'lt':
                                found = docSearchCol < params[key].val;
                                break;
                            case 'gt':
                                found = docSearchCol > params[key].val;
                                break;

                        }
                    } else if(doc[key] != params[key]) {
                        found = false;
                    }
                }
                if(found) {
                    results.push(doc);
                }
            }
            return results;
        }
    })
    .provider('documentation', [function () {
        var documentation = null, lastPromise = false;
        
        this.$get = ['$http', '$q', 'dataFilter', function ($http, $q, dataFilter) {
            return {
                getAllDocuments: function () {
                    return documentation;
                },
                search: function (searchIn, params) {
                    if(searchIn && !params) {
                        params = searchIn;
                        searchIn = documentation;
                    }
                    var deferred = $q.defer();
                    var self = this;
                    if(!searchIn) {
                        this.load().then(function (data) {
                            self.search(data, params).then(deferred.resolve).catch(deferred.reject);
                        }).catch(deferred.reject);
                        return deferred.promise;
                    }
                    
                    
                    deferred.resolve(dataFilter(searchIn, params));
                    return deferred.promise;
                },
                
                load: function () {
                    if(lastPromise) {
                        return lastPromise;
                    }
                    
                    var deferred = $q.defer();
                    $http.get('site.json').then(function (resp) {
                        documentation = resp.data;
                        deferred.resolve(resp.data);
                    }).catch(deferred.reject);
                    lastPromise = deferred.promise;
                    return deferred.promise;
                }
            };
        }];
    }])
    .value('LanguageFileSuffixes', {
        css: 'css',
        js: 'javascript',
        json: 'json',
        php: 'php',
        java: 'java',
        rb: 'ruby',
        xml: 'xml',
        html: 'xml',
        tpl: 'xml',
        scss: 'scss'
    })