angular.module('docular.services', [])
    .service('markdown', function () {
        
        var renderer = new marked.Renderer();
        renderer.code = function (code, lang) {
            var viewer = $('<source-viewer>');
            viewer.attr('source', "'" + code.replace(/(')/g, '\\\'').replace(/&/g, '&amp;') + "'");
            viewer.attr('file-type', "'" + lang + "'");
            return $('<div>').append(viewer).html();
        }
        
        return function (raw, options) {
            if(!options) { options = {}; }
            if(!options.renderer) { options.renderer = renderer; }
            return marked(raw, options);
        }
    })
    .provider('pageData', function () {
        var pageAttrs = {
            title: null
        };
        this.$get = [function () {
            return pageAttrs;
        }]
    })
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
                    if(typeof params[key] === 'object') {
                        switch(params[key].op) {
                            case 'like': 
                                found = doc[key].indexOf(params[key].val) != -1
                            break;
                            case 'ilike': 
                                found = ("" + doc[key]).toLowerCase().indexOf(params[key].val) != -1
                            break;
                            case 'lt':
                                found = doc[key] < params[key].val;
                                break;
                            case 'gt':
                                found = doc[key] > params[key].val;
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
        php: 'php',
        java: 'java',
        rb: 'ruby',
        xml: 'xml',
        html: 'xml',
        tpl: 'xml',
        scss: 'scss'
    })