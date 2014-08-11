var Q = require('q');

var Group = require('./group');
var Registry = require('./registry');
var path = require('path');
var nodeExtend = require('node.extend');
var util = require('util');
var fs = require('fs');

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
        var maps = [];
        var placement = {
            left: 0,
            right: 1,
            depth: 0
        };
        this.registry.each(function (item) {
            this.exportDocModel(item, maps, nodeExtend({}, placement));
        }.bind(this));
        
        var baseFolder = this.option('docular_webapp_target');
        
        fs.writeFileSync(baseFolder + '/data.json', JSON.stringify(maps, null, 4));
//        console.log(util.inspect(maps, {depth: null}));
    },
    
    exportDocModel: function (item, maps, placement) {
        var data = item.toJSON();
        var subdocs = data.subdocs || [];
        maps.push(data);
        placement.left = placement.left + 1;
        placement.right = placement.left + 1;
        
        data.left = placement.left;
        data.level = placement.depth;
        
        var childPlacement = nodeExtend({}, placement);
        childPlacement.depth++;
        
        for(var i = 0, l = subdocs.length; i < l; i++) {
            this.exportDocModel(subdocs[i], maps, childPlacement);
            if(i < l) {
                childPlacement.left = childPlacement.right;
            }
        }
        if(subdocs.length > 0) {
            placement.right = childPlacement.right + 1;
        }
        
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