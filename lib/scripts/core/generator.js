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

var DocModel = function (docData) {this.data = docData;};
DocModel.prototype.addSubdoc = function (doc) {
    if(!this.data.subdocs) {
        this.data.subdocs = [];
    }
    this.data.subdocs.push(doc);
};
    
DocModel.prototype.toJSON = function () {
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
                .then(this.loadFiles.bind(this))
                .then(this.parseFiles.bind(this))
                .then(this.backfillParseData.bind(this))
                .then(this.createDocs.bind(this))
                .then(this.buildRegistry.bind(this))
                .then(this.exportDocFiles.bind(this))
                .then(this._deferred.resolve)
                .catch(this._deferred.reject);
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
        this.registry.each(function (item) {
            var itemData = item.toJSON();
            this.exportDocModel(item, docs, nodeExtend({root: itemData.id}, placement));
        }.bind(this));
        
        var structure = this.toJSON();
        
        var baseFolder = this.option('docular_webapp_target');
        
        fse.ensureDirSync(baseFolder);
        
        this.emit('SetupConfig', structure);
        
        fs.writeFileSync(baseFolder + '/site.json', JSON.stringify(docs, null, 4));
        fs.writeFileSync(baseFolder + '/structure.json', JSON.stringify(structure, null, 4));
        
        fse.ensureDirSync(baseFolder + '/sources/');
        for(var i = 0, l = docs.length; i < l; i++) {
            fse.ensureFileSync(baseFolder + '/sources/' + docs[i].file);
            fse.copySync(docs[i].file, baseFolder + '/sources/' + docs[i].file);
        }
        
        DependencyHandler.loadDependencies(structure.dependencies).then(function (files) {
            console.log("Dependencies saved");
            fse.ensureDirSync(baseFolder + '/resources');
            fse.copySync(path.resolve(__dirname, '../../', './resources/templates'), baseFolder + '/resources/templates');
            fse.copySync(path.resolve(__dirname, '../../', './resources/css'), baseFolder + '/resources/css');
            fse.copySync(path.resolve(__dirname, '../../', './resources/img'), baseFolder + '/resources/img');
            fse.copySync(path.resolve(__dirname, '../../', './resources/js'), baseFolder + '/resources/js');
            
            this.emit('CopyFiles', baseFolder);
            
            swig.setDefaults({
                locals: {
                    config: structure
                },
                varControls: ['{=', '=}'] //Angular uses the same set, and we don't want swig interpreting angular syntax.
            });
            
            var indexPromise = Q.defer();
            fileWritePromises.push(indexPromise.promise);
            swig.renderFile(path.resolve(__dirname, '../../', './resources/index.html'), structure, function (err, output) {
                if(err) {
                    console.log(err)
                    indexPromise.reject(err);
                }
                fs.writeFileSync(baseFolder + '/index.html', output);
                indexPromise.resolve();
            });

            DependencyHandler.copyDependencies(structure.dependencies, baseFolder);
            Q.all(fileWritePromises).then(deferred.resolve).catch(deferred.reject);
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
                        console.warn("No parent doc of " + JSON.stringify(item.getParentQuery()) + " for " + item.name);
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