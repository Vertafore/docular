
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
        var workingDirectory = path.relative(process.cwd(), __dirname + '/lib/webapp/');

        exec(command_gen_docs, {cwd: workingDirectory}, function(err, stdout, stderr) {
            //bubble up errors that may come from this process and call the callback
            console.log(stdout);
            callBack();
        });
    },

    loadDocAPI: function(docAPI, callBack) {

        var callBack = callBack || noop;
        var isDocularDocApi = /^docular-doc-api-([^\/\\]+)$/;

        //first make sure it is a valid namespaced doc_api
        if(isDocularDocApi.test(docAPI)){

            //the command to install an npm package
            var command_add_api = 'npm install ' + docAPI;

            //determine the working directory for this command (this script could be being called from grunt plugin)
            var workingDirectory = path.relative(process.cwd(), __dirname);

            exec(command_add_api, {cwd: workingDirectory}, function(err, stdout, stderr) {
                //bubble up errors that may come from this process and call the callback
                console.log(stdout);
                callBack();
            });

        } else {

            console.log("WARNING: The docAPI '" + docAPI + "', does not follow the docular-doc-api- namespacing convention.");
            callBack();

        }
    }
};