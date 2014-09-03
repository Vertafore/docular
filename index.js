var gen_docs = require('./lib/scripts/docGenerator.js');
var Q = require('q');
Q.longStackSupport = true;
module.exports = {

    genDocs: function (options) {
        return gen_docs.generate(options);

    }
};