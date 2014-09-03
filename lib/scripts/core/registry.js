var Registry = require('./class').extend({
    __constructor: function () {
        this.__base();
        this._items = {};
    },
    addItem: function (id, data) {
        if(this._items[id]) {
            console.warn("Item " + id + " already exists in registry");
//            console.log(data)
        }
        this._items[id] = data;
    },
    getItem: function (id) {
        return this._items[id];
    },
    removeItem: function (id) {
        delete this._items[id];
    },
    each: function (callback) {
        for(var key in this._items) {
            callback(this._items[key], key);
        }
    },
    find: function (query) {
        for(var key in this._items) {
            var item = this._items[key];
            var found = true;
            for(var queryKey in query) {
                if(item[queryKey] != query[queryKey] && query[queryKey] !== undefined) {
                    found = false;
                }
            }
            if(found) {
                return item;
            }
        }
    }
});

module.exports = Registry;