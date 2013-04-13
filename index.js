
var exec = require('child_process').exec;
var gen_docs = require(__dirname + '/lib/scripts/gen-docs.js');
var path = require('path');

module.exports = {

    genDocs: function (options, callBack) {

        gen_docs.generate(options, callBack);

    },

    server: function(port, callBack) {

        //Run the gen-docs script
        var serverScript = path.relative(process.cwd(), __dirname + '/lib/nodeserver/server.js ');
        var command_gen_docs = 'node ' + serverScript + port;

        exec(command_gen_docs, function(err, stdout, stderr) {
            //bubble up errors that may come from this process
            console.log(stdout);
            //make good on the async promise
            callBack();
        });
    }

};


