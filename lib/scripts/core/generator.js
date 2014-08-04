var Q = require('q');

var Group = require('./group');
var Registry = require('./registry');
var path = require('path');
var nodeExtend = require('node.extend');
var util = require('util');

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
        this.registry.each(function (item, key) {
            var map = this.exportDocModel(item);
            maps.push(map);
        }.bind(this));
        console.log(maps);
    },
    
    exportDocModel: function (item) {
        var data = item.toJSON();
        var subdocs = data.subdocs || [];
        data.subdocs = [];
        for(var i = 0, l = subdocs.length; i < l; i++) {
            data.subdocs.push(this.exportDocModel(subdocs[i]));
        }
        return data;
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
                            console.log("Not linking item to self", item.getParentQuery());
                        } else {
                            linked.push(item.id);
                            parentItem.addSubdoc(item);
                        }
                    } else {
                        console.warn("No parent doc of " + JSON.stringify(item.getParentQuery()) + " for " + item.name);
                    }
                } else {
                    console.log("Not looking up a parent doc for " + item.name);
                }
            }.bind(this));
            
            for(var i = 0, l = linked.length; i < l; i++) {
                this.registry.removeItem(linked[i]);
            }
            console.log(util.inspect(this.registry._items, {depth: 1}));
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