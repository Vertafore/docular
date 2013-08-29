
var exec = require('child_process').exec;
var gen_docs = require(__dirname + '/lib/scripts/gen-docs.js');
var path = require('path');
var noop = function(){};

module.exports = {

    genDocs: function (options, callBack) {

        var callBack = callBack || noop;
        gen_docs.generate(options, callBack);

    },

    server: function(port, callBack) {

        var callBack = callBack || noop;

        //Run the gen-docs script
        var serverScript = '../nodeserver/server.js ';
        var command_gen_docs = 'node ' + serverScript + port;

        //determine the working directory for this command (this script could be being called from grunt plugin)
        var workingDirectory = path.relative(process.cwd(), gen_docs.workingWebappFolder());

        exec(command_gen_docs, {cwd: workingDirectory}, function(err, stdout, stderr) {
            //bubble up errors that may come from this process and call the callback
            console.log(stdout);
            callBack();
        });
    }
};