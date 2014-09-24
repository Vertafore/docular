var Q = require('q');

var Group = require('./group');
var Registry = require('./registry');
var DependencyHandler = require('./dependencyHandler')
var path = require('path');
var nodeExtend = require('node.extend');
var util = require('util');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var swig = require('swig');
var less = require('less');

var DocModel = function (docData) {
    this.data = docData;
    Object.defineProperty(this, "name", {
        get: function () {
            return this.data.name;
        }
    });
    Object.defineProperty(this, "id", {
        get: function () {
            return this.data.name;
        }
    });
    Object.defineProperty(this, "module", {
        get: function () {
            return this.data.module;
        }
    });
};
DocModel.prototype.addSubdoc = function (doc) {
    if(!this.data.subdocs) {
        this.data.subdocs = [];
    }
    this.data.subdocs.push(doc);
};

DocModel.prototype.toJSON = function () {
    this.data.sortOn = this.data.name;
    this.data.search = this.data.name;
    return this.data;
};

var rootCounter = 1;
var Generator = Group.extend({
    _deferred: null,

    _groups: null,

    __constructor: function (groupData) {
        this.setRegistry(new Registry());
        this.__base(groupData);
        this.removeAllListeners('GetPath');
    },

    start: function() {

        this.option('groupId', 'Base');

        this._deferred = Q.defer();

        this.kickOff();

        return this._deferred.promise;
    },

    kickOff: function() {
        return Q.fcall(this.loadPlugins.bind(this))
            .then(this.processConfig.bind(this))
            .then(function () {
                var deferred = Q.defer();
                this.setupGroups();
                deferred.resolve();
                return deferred.promise;
            }.bind(this))
            .then(this.loadFiles.bind(this))
            .then(this.parseFiles.bind(this))
            .then(this.backfillParseData.bind(this))
            .then(this.createDocs.bind(this))
            .then(this.buildRegistry.bind(this))
            .then(this.exportDocFiles.bind(this))
            .then(this._deferred.resolve)
            .catch(this._deferred.reject);
    },

    processConfig: function () {
        var promises = [];
        var ops = nodeExtend({}, this._options);
        this.emit('ProcessConfig', ops, promises);
        var deferred = Q.defer();
        Q.all(promises).then(function () {
            this.setOptions(ops);
            deferred.resolve();
        }.bind(this)).catch(deferred.reject);
        return deferred.promise;
    },

    exportDocFiles: function () {
        var deferred = Q.defer();
        var docs = [];
        var fileWritePromises = [];
        var placement = {
            left: 0,
            right: 1,
            depth: 0
        };
        var self = this;
        this.registry.each(function (item) {
            var itemData = item.toJSON();
            this.exportDocModel(item, docs, nodeExtend({root: itemData.id}, placement));
        }.bind(this));

        var structure = this.toJSON();

        var baseFolder = this.option('docular_webapp_target');

        fse.ensureDirSync(baseFolder);
        var promises = [];
        this.emit('SetupRunConfig', structure, promises);

        Q.all(promises).then(function () {

            fs.writeFileSync(baseFolder + '/site.json', JSON.stringify(docs, null, 4));
            fs.writeFileSync(baseFolder + '/structure.json', JSON.stringify(structure, null, 4));

            fse.ensureDirSync(baseFolder + '/sources/');
            for (var i = 0, l = docs.length; i < l; i++) {
                if (docs[i].file) {
                    fse.ensureFileSync(baseFolder + '/sources/' + docs[i].file);
                    fse.copySync(docs[i].file, baseFolder + '/sources/' + docs[i].file);
                }
            }


            function writeCore() {
                var lessFile = path.resolve(__dirname, '../../', './resources/less/docular.less');
                var lessTargetFile = path.resolve(__dirname, '../../', './resources/css/docular.css');
                var parser = new (less.Parser)({
                    paths: ['.', './lib'], // Specify search paths for @import directives
                    filename: lessFile // Specify a filename, for better error messages
                });
                var lessContent = fs.readFileSync(lessFile, 'utf8'), extraStyles = [], lessResolver = Q.defer();
                fileWritePromises.push(lessResolver.promise)
                self.emit('GetStyles', extraStyles);

                lessContent = lessContent + extraStyles.join('\n');

                parser.parse(lessContent, function (e, tree) {
                    if (e) {
                        lessResolver.reject(e);
                        return;
                    }
                    fse.ensureFileSync(lessTargetFile);
                    fs.writeFileSync(lessTargetFile, tree.toCSS({

                    }));
                    fse.copySync(path.resolve(__dirname, '../../', './resources/css'), baseFolder + '/resources/css');
                    lessResolver.resolve();
                }.bind(this));

                swig.setDefaults({
                    locals: {
                        config: structure
                    },
                    varControls: ['{=', '=}'] //Angular uses the same set ( {{ and }} ), and we don't want swig interpreting angular syntax.
                });

                var indexPromise = Q.defer();
                fileWritePromises.push(indexPromise.promise);
                swig.renderFile(path.resolve(__dirname, '../../', './resources/index.html'), structure, function (err, output) {
                    if (err) {
                        console.log(err)
                        indexPromise.reject(err);
                    }
                    fs.writeFileSync(baseFolder + '/index.html', output);
                    indexPromise.resolve();
                });

                fse.ensureDirSync(baseFolder + '/resources');
                fse.copySync(path.resolve(__dirname, '../../', './resources/templates'), baseFolder + '/resources/templates');
                fse.copySync(path.resolve(__dirname, '../../', './resources/img'), baseFolder + '/resources/img');
                fse.copySync(path.resolve(__dirname, '../../', './resources/js'), baseFolder + '/resources/js');

            }

            if(!this.option('disableDependencyDownloads')) {
                DependencyHandler.loadDependencies(structure.dependencies).then(function (files) {
                    console.log("Dependencies saved");
                    fse.ensureDirSync(baseFolder + '/resources/fonts');
                    fse.copySync(path.resolve(__dirname, '../../../', './bower_components/fontawesome/fonts'), baseFolder + '/resources/fonts');
                    fse.copySync(path.resolve(__dirname, '../../../', './bower_components/bootstrap/fonts'), baseFolder + '/resources/fonts');

                    writeCore();

                    DependencyHandler.copyDependencies(structure.dependencies, baseFolder);
                    Q.all(fileWritePromises).then(deferred.resolve).catch(deferred.reject);
                }.bind(this)).catch(deferred.reject);
            } else {
                writeCore();
                Q.all(fileWritePromises).then(deferred.resolve).catch(deferred.reject);
            }
            this.emit('CopyFiles', baseFolder);
        }.bind(this)).catch(deferred.reject);

        return deferred.promise;
    },

    exportDocModel: function (item, docs, placement) {
        var data = item.toJSON();
        var subdocs = data.subdocs || [];
        docs.push(data);
        placement.left = placement.left + 1;
        placement.right = placement.left + 1;

        data.left = placement.left;
        data.level = placement.depth;
        data.root = placement.root;

        var childPlacement = nodeExtend({}, placement);
        childPlacement.depth++;

        for(var i = 0, l = subdocs.length; i < l; i++) {
            this.exportDocModel(subdocs[i], docs, childPlacement);
            if(i < l) {
                childPlacement.left = childPlacement.right;
            }
        }
        if(subdocs.length > 0) {
            placement.right = childPlacement.right + 1;
        }
        delete data.subdocs;
        data.right = placement.right;
    },

    buildRegistry: function () {
        var linked = [];
        return this.runRecursively('buildRegistry').then(function () {
            this.registry.each(function (item, key) {
                if(item.hasParent()) {
                    var query = item.getParentQuery();
                    var queryWithGroup = Object.create(query);
                    queryWithGroup.groupId = item.groupId;
                    var parentItem = this.registry.find(queryWithGroup);
                    if(!parentItem) {
                        console.log("Not found on query")
                        parentItem = this.registry.find(query);
                    }
                    if(parentItem) {
                        if(parentItem === item) {
//                            console.log("Not linking item to self", item.getParentQuery());
                        } else {
                            linked.push(item.id);
                            parentItem.addSubdoc(item);
                        }

                    } else {
                        console.warn("No parent doc of " + JSON.stringify(item.getParentQuery()) + " for " + item.name + ", creating a default one");
                        parentItem = new DocModel({
                            name: item.getParentQuery().name,
                            groupId: item.groupId,
                            path: item.path,
                            module: item.getParentQuery().name,
                            id: item.getParentQuery().name,
                            handler: item.handler
                        });
                        this.registry.addItem(item.getParentQuery().name, parentItem);
                        parentItem.addSubdoc(item);
                    }
                } else {
//                    console.log("Not looking up a parent doc for " + item.name);
                }
            }.bind(this));

            for(var i = 0, l = linked.length; i < l; i++) {
                this.registry.removeItem(linked[i]);
            }
        }.bind(this));
    },

    loadPlugins: function() {
        var deferred = Q.defer();

        var plugins = this.option('plugins');
        for (var i = 0, l = plugins.length; i < l; i++) {
            try {
                var plugin = new plugins[i]();
                plugin.register(this);
            } catch (e) {
                console.error("Could not register plugin: " + plugins[i]);
                console.log(e);
                deferred.reject(e);
                return deferred.promise;
            }
        }
        deferred.resolve();
        return deferred.promise;
    }
});
module.exports = Generator;