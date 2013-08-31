
var exec = require('child_process').exec;
var gen_docs = require(__dirname + '/lib/scripts/gen-docs.js');
var path = require('path');
var noop = function(){};

module.exports = {

    genDocs: function (options, callBack) {

        var callBack = callBack || noop;
        gen_docs.generate(options, callBack);

    },

    server: function(options, callBack) {

        var options = options || {};
        var callBack = callBack || noop;

        //determine the working directory for this command (this script could be being called from grunt plugin)
        var workingDirectory = process.cwd() + '/' + path.relative(process.cwd(), gen_docs.workingWebappFolder(options.docular_webapp_target));

        //Run the gen-docs script
        var ABS_SERVER_SCRIPT = __dirname + '/lib/nodeserver/server.js';
        var REL_SERVER_SCRIPT = path.relative(workingDirectory, ABS_SERVER_SCRIPT);
        var command_gen_docs = 'node ' + REL_SERVER_SCRIPT + ' ' + options.port;

        exec(command_gen_docs, {cwd: workingDirectory}, function(err, stdout, stderr) {
            //bubble up errors that may come from this process and call the callback
            console.log(stdout, err, stderr);
            callBack();
        });
    }
};