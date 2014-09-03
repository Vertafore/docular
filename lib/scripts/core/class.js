var nodeExtend = require('node.extend');
var events = require("events");
var inherit = require('inherit');

var Class = inherit(events.EventEmitter, {
    
    _options: null,
    
    __constructor: function () {
        events.EventEmitter.call(this);
    },
    
    setOptions: function (options) {
        this._options = options;
    },
    option: function (key, val) {
        if(val) {
            this._options[key] = val;
        }
        return this._options[key];
    }
}, {
    extend: function (proto, static) {
        var newClass = inherit(this, proto || {}, static || {});
        return newClass;
    }
});

module.exports = Class;