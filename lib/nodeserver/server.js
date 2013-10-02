
/*============ DEPENDENCIES ============*/

var sys = require('sys'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    qfs = require('q-fs'),
    path = require('path'),
    express = require('express'),
    request = require('request'),
    doc_utils = require('../scripts/doc_utils.js'),
    nodeExtend = require('node.extend');


/*=========== SOME URL PATHS ===========*/

var ABS_SERVER = __dirname;
var ABS_CONTROLLER = ABS_SERVER + '/controller';
var ABS_CONFIGS = ABS_SERVER + '/configs';


/*============ PRIVATE VARIABLES AND METHODS ============*/

var DEFAULT_PORT = 8000;

//stores configs for different loaded plugins
var serverConfigs = {};

var addQueryParams = function(url, queryParams){
    var query = "";
    var glue = url.indexOf("?") == -1 ? "?" : "&";
    for(var param in queryParams) {
        if(queryParams.hasOwnProperty(param)){
            url = url + glue + param + "=" + queryParams[param];
            glue = "&";
        }
    }
    return url;
};

//let's gather all configured controllers from the incoming args
var controllers = {};


/*============ API OBJECT TO BE PASSED TO ALL CONTROLLERS ============*/

var api = {
    sys: sys,
    http: http,
    https: https,
    fs: fs,
    path: path,
    request: request,
    addQueryParams: addQueryParams,
    nodeExtend: nodeExtend
};


/*============ INITIALIZATION FUNCTION ============*/

var main = function (argv) {

    var app = express();

    //for posts we need to parse the body
    app.use(express.bodyParser());

    //route any controller calls to the proper plugin
    app.use(function(req, res, next){

        //are we hitting the controller
        var CONTROLLER = /controller\/([^\/]{1,})\/([^\/]{1,})\/([\s\S]{1,})$/;

        var match = req.url.match(CONTROLLER);
        if(match) {

            var pluginName = match[1];
            var pluginController = match[2];

            if(controllers[pluginName] && controllers[pluginName][pluginController]){

                req.url = req.url.replace('/controller/' + pluginName + '/' + pluginController,'');

                var controllerConfigs = serverConfigs[pluginName] || {};

                try {
                    controllers[pluginName][pluginController](req, res, next, api, controllerConfigs);
                } catch (e) {
                    console.log("CONTROLLER ERROR: " + pluginName + '/' + pluginController, e);
                }

            //otherwise we don't have a controller so just continue down the pipeline
            } else {
                next();
            }

        } else {
            next();
        }

    });

    //We need to setup some rewriting because of AngularJS HTML5 mode
    app.use(function(req, res, next){

        //let all legit static content come on through (note we ignore these files with ? query params)
        //NOTE: PHP SHOULD NEVER BE IN THIS LIST AS SERVER CONFIGS ARE STORED IN PHP FILES FOR APACHE SERVERS
        var REWRITE = /\/(.*)$/,
            STATIC_FILE = /(\.(css|js|png|jpg|woff|ttf|otf|eot|txt)$|\.(css|js|png|jpg|woff|ttf|otf|eot|txt)\?(.*)$|partials\/.*\.html$)/;

        var match = req.url.match(REWRITE);
        if (!STATIC_FILE.test(req.url) && match) {
            req.url = req.url.replace(match[0], '/index.html');
        }
        next();

    });

    //Error handling
    app.use(function(err, req, res, next) {
        sys.puts(err);
    });

    //set up the general static server
    app.use(express.static(process.cwd()));

    //begin listening
    app.listen(Number(argv[2]) || DEFAULT_PORT);
};


/*============ INITIALIZE ============*/

//first we need to load all plugin controllers
Q.when(qfs.listTree(ABS_CONTROLLER), function(files){

    var isController = /\/([^\/]{1,})\/([^\/]{1,})\/controller.js$/;

    //look for any api.js files within subdirectories of the doc_apis directory
    files.forEach(function(file) {

        var matches = isController.exec(doc_utils.normalizeFile(file));

        if(matches){
            try{
                controllers[matches[1]] = controllers[matches[1]] || {};
                controllers[matches[1]][matches[2]] = require(file).controller;
            } catch(e) {
                console.log("Failed to load server controller:" + matches[1] + "/" + matches[2] + " ", e);
            }
        }
    });


//next we need to load all server configs and start us up
}).then(function(){

    try {
        serverConfigs = require(ABS_CONFIGS + '/configs.js').configs;
    } catch (e) {
        console.log("Failed to load server configs", e);
    }

    //now that we have loaded all controllers and configs, start us up
    main(process.argv);
});

