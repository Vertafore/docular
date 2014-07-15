
var exec = require('child_process').exec;
var gen_docs = require(__dirname + '/lib/scripts/gen-docs.js');
var path = require('path');
var noop = function(){};

module.exports = {

    genDocs: function (options, callBack) {
        console.log(options)
        var callBack = callBack || noop;
        gen_docs.generate(options, callBack);

    }
};