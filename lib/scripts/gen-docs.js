
/**
 * @doc module
 * @name docular
 * @description This module contains all the logic for the workflow of generating
 * partials and front end resources for display of docular documentation.
 *
 * Based off of Angular.js original implementation of gen-docs.js
 * Documentation code licensed under CC BY 3.0
 * http://creativecommons.org/licenses/by/3.0/
 */

/**
 * @doc function
 * @name docular.class:gen-docs
 * @requires docular.class.reader
 * @requires docular.class.writer
 * @requires docular.class.docular_utils
 * @requires node.class.qq
 * @requires node.class.q-fs
 * @requires node.class.fs
 * @requires node.class.node.extend
 * @requires node.class.colors
 * @description The gen-docs class has really only one public method "generate" which runs a mostly
 * asynchronous workflow that pulls in the docular doc apis to then parse the files and then generate
 * the HTML and partial files. It also then generates several javascript files that the UI will use
 * to access the partials.
 */


/*============ DEPENDENCIES ============*/

var reader = require('./reader.js'),
    writer = require('./writer.js'),
    doc_utils = require('./doc_utils.js'),
    SiteMap = require('./SiteMap.js').SiteMap,
    appCache = require('./appCache.js').appCache,
    Q = require('q'),
    qfs = require('q-fs'),
    fs = require('fs'),
    path = require('path'),
    nodeExtend = require('node.extend'),
    colors = require('colors');

//default group configurations
var angularGroup = require('./defaultGroups/group_angular.js').config;
var docularGroup = require('./defaultGroups/group_docular.js').config;
var docularGroupExamples = require('./defaultGroups/group_docular_examples.js').config;

/*============ UTILITY FUNCTIONS ============*/

var now = function () { return new Date().getTime(); };
var noop = function () {};

console.section = function (message) {
    console.log("-------- " .grey + message.grey + " --------".grey);
};


/*=========== PRIVATE VARIABLES/FUNCTIONS ===========*/

//some global error handling
process.on('uncaughtException', function(err) {
    console.error(err.stack || err);
});

var addLocalGroup = function (localGroup, groups) {

    //determine the proper root location
    var rootLocation = __dirname + '/../../';

    //we need to update the URLS for the resources because they are relative to the docular package root
    for (var i=0; i < localGroup.sections.length; i++) {

        var thisSection = localGroup.sections[i];

        thisSection.scripts = thisSection.scripts || [];
        for (var j=0; j < thisSection.scripts.length; j++) {
            thisSection.scripts[j] = path.resolve(rootLocation + thisSection.scripts[j]);
        }

        thisSection.docs = thisSection.docs || [];
        for (var j=0; j < thisSection.docs.length; j++) {
            thisSection.docs[j] = path.resolve(rootLocation + thisSection.docs[j]);
        }
    }

    groups.push(localGroup);
};


/*============ PUBLIC generate function ============*/

/**
 * @doc method
 * @name docular.class:gen-docs#generate
 * @methodOf docular.class:gen-docs
 * @param {object} options_in This is the configuration which includes the groups of docs to parse
 * @param {function} callBack Function will be called when generation is complete
 * @description This is the main function to be called to kick of documentation generation.
 */

var generate = function (options_in, callBack) {

    //just drop us down a line in the console.. a little padding looks nice
    console.log("");

    /*============ CONFIGURATION SETUP ============*/

    //this represents the basic options API
    var defaultOptions = {

        groups : [], //a list of groups which will contain paths to documentation that needs parsing

        baseUrl: '/', //where is the root for this documentation app?

        docAPIOrder: ['doc', 'angular'], //order of doc_apis CSS and JS in the UI

        javascript: [], //you can specify an ordered list of scripts to be loaded into the UI
        css: [], //you can specify an ordered list of css files to be loaded into the UI

        plugins: [], //an array of strings that indicate Docular plugins to maker sure are loaded (must start with docular-)

        showAngularDocs: false, //do you want to have angular's docs parsed and shown in the UI?
        showDocularDocs: false, //do you want to have docular's docs parsed and shown in the UI?

        analytics: {account:false, domainName:false}, //optional turn on google analytics
        discussions: {shortName:false, url:false, dev: false}, //optional turn on disqus

        docular_partial_home: false, //you can provide a url to partial to be used on the homepage, if not defined it will pull in a default
        docular_partial_navigation: false, //you can provide a url to partial to be injected in the navigation
        docular_partial_footer: false, //you can provide a url to partial to be injected as the footer
        docular_partial_group_index: false, //you can provide a url to partial to be used on as the root page of a group, if not defined it will pull in a default

        docular_webappDir : undefined // External webapp folder for static documentation
    };

    var options = nodeExtend(true, defaultOptions, options_in);

    var groups = options.groups || [];
    var uiOrder = options.docAPIOrder || [];

    var NODE_MODULES_PATH = '/node_modules';
    var docularAPIPrefix = 'docular-doc-api-';
    var defaultDocAPI = docularAPIPrefix + 'doc';

    var baseUrl = options.baseUrl || false;

    var showAngularDocs = options.showAngularDocs || false;
    var showDocularDocs = options.showDocularDocs || false;

    if(showDocularDocs){
        addLocalGroup(docularGroup, groups);
        addLocalGroup(docularGroupExamples, groups);
    }
    if(showAngularDocs){addLocalGroup(angularGroup, groups);}


    /*============ PRIVATE METHODS / VARIABLES ============*/

    var start = now();
    var docs = [];
    var groupIds = {};
    var doc_apis = {};
    var ui_plugins = {};
    var ui_plugins_configs = {};

    var endGenerateDocumentation = function () {
        callBack();
        return;
    };

    //setup relative paths to the current working directory
    var ABS_SCRIPTS = __dirname;
    var ABS_LIB = path.resolve(ABS_SCRIPTS + '/..');
    var ABS_BASE = path.resolve(ABS_LIB + '/..');
    var ABS_RESOURCES =  ABS_LIB + '/resources'; //need to back out one directory back to lib
    var ABS_WEBAPP_RESOURCES_FOLDER = ABS_LIB + '/webapp';
    var ABS_DEFAULT_GENERATED_WEBAPP = ABS_LIB + '/generated/';
    var ABS_NODE_MODULES = ABS_BASE + NODE_MODULES_PATH;
    var ABS_GLOBAL_NODE_MODULES = path.resolve(ABS_NODE_MODULES + '/../../');

    var REL_SCRIPTS = path.relative(process.cwd(), ABS_SCRIPTS);
    var REL_LIB = path.relative(process.cwd(), ABS_LIB);
    var REL_BASE = path.relative(process.cwd(), ABS_BASE);
    var REL_WEBAPP_RESOURCES_FOLDER = path.relative(process.cwd(), ABS_WEBAPP_RESOURCES_FOLDER);
    var REL_RESOURCES = path.relative(process.cwd(), ABS_RESOURCES);
    var REL_DOC_APIS = path.relative(process.cwd(), ABS_NODE_MODULES);

    var ABS_WEBAPP = options.docular_webapp_target ? path.resolve(process.cwd() + '/' + options.docular_webapp_target) : ABS_DEFAULT_GENERATED_WEBAPP;
    var REL_WEBAPP = path.relative(process.cwd(), ABS_WEBAPP);

    var getLayoutMetaData = function () {

        var layoutMetaData = {};
        for(var doc_api in doc_apis) {
            if(doc_apis.hasOwnProperty(doc_api)){
                layoutMetaData[doc_api] = {
                    identifier: doc_apis[doc_api].identifier,
                    title: doc_apis[doc_api].title,
                    layout: doc_apis[doc_api].layout
                };
            }
        }

        return layoutMetaData;
    };

    var generateGroupManifest = function (groups) {};

    var generateSupportingFiles = function (writeFutures) {

        // We need to generate an array of page meta data for searching and partial loading in the UI
        var doc_metadata = doc_utils.metadata(docs);
        writer.output(ABS_WEBAPP + '/documentation/docs-metadata.js',
            ['DOC_DATA=', JSON.stringify(doc_metadata).replace(/\{/g, '\n{'), ';']
        );

        // We need to generate the group information for the UI
        var group_metadata = groups;
        writer.output(ABS_WEBAPP + '/documentation/groups-metadata.js',
            ['GROUP_DATA=', JSON.stringify(group_metadata).replace(/\{/g, '\n{'), ';']
        );

        // Lastly we should send out doc_apis information for the UI
        // This information is used by the UI to sort sections in modules and provide links to documentation
        writer.output(ABS_WEBAPP + '/documentation/layout-metadata.js',
            ['LAYOUT_DATA=', JSON.stringify(getLayoutMetaData()).replace(/\{/g, '\n{'), ';']
        );

        // @todo run through these that were used in original ngdocs and port over the functionality
        // writeFuture.push(writer.output('sitemap.xml', new SiteMap(docs).render()));
        // writesFuture.push(writer.output('robots.txt', 'Sitemap: http://docs.angularjs.org/sitemap.xml\n'));
        // writesFuture.push(writer.output('appcache.manifest',appCache()));
        // writesFuture.push(writer.copyTemplate('.htaccess')); // will be rewritten, don't symlink
    };

    var generateConfigScript = function (baseUrl) {

        var configScript = "";

        //first determine if we have a baseURL to configure
        if(baseUrl){
            configScript = configScript + "baseURL = '" + baseUrl + "'; addTag('base', {href: baseURL}); ";
        }

        // GA asynchronous tracker
        if(options.analytics.account && options.analytics.domainName) {
            configScript = configScript + " " +
            "var _gaq = _gaq || []; " +
            "_gaq.push(['_setAccount', '" + options.analytics.account + "']); " +
            "_gaq.push(['_setDomainName', '" + options.analytics.domainName + "']); " +
            "(function() { " +
                "var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; " +
                "ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'; " +
                "var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s); " +
            "})(); ";
        }

        // Disqus Configurations
        var discussionsActive = (options.discussions.shortName || options.discussions.url) ? true : false;

        configScript = configScript + " " +
        "window.discussionConfigs = {active:"+
        discussionsActive + ", shortName:'" +
        options.discussions.shortName + "', url:'" +
        options.discussions.url + "', dev:" +
        options.discussions.dev + "}; ";

        writer.output(ABS_WEBAPP + '/documentation/docular-configuration.js',[configScript]);
    };

    var generateWebappPartials = function () {

        var partials = {
            'docular_partial_home' : options.docular_partial_home ? options.docular_partial_home : ABS_RESOURCES + '/templates/docular_partial_home.html',
            'docular_partial_group_index' : options.docular_partial_group_index ? options.docular_partial_group_index : ABS_RESOURCES + '/templates/docular_partial_group_index.html',
            'docular_partial_navigation' : options.docular_partial_navigation ? options.docular_partial_navigation : ABS_RESOURCES + '/templates/docular_partial_navigation.html',
            'docular_partial_footer' : options.docular_partial_footer ? options.docular_partial_footer : ABS_RESOURCES + '/templates/docular_partial_footer.html'
        };

        for(var partialName in partials){
            if(partials.hasOwnProperty(partialName)){
                var content;
                content = fs.readFileSync(partials[partialName]);
                writer.output(
                    ABS_WEBAPP + '/resources/docular-partials/'+ partialName +'.html',
                    content.toString()
                );
            }
        }
    };


    //main logic to intialize the documentation generation for a particular documentation group
    var processGroup = function (sectionObj, groupId, doc_apis, showSource) {

        console.log('Extracting ' + groupId.cyan + ' Docs For Section "' + sectionObj.id.cyan + '"...');

        //keep track of all groupIds so we can create directories for each of them later
        groupIds[groupId] = true;

        try {

            return reader.collect(

                {
                    group: groupId,
                    section: sectionObj.id,
                    scripts: sectionObj.scripts,
                    docs: sectionObj.docs,
                    showSource: showSource
                },

                doc_apis,

                ABS_WEBAPP

            ).then(function(results){

                //all docs in a section should be using the same doc_api so we only need to grab the first one
                //determine which type of doc_api was used. The UI needs this so it knows how to group docs
                //as well as provide the right copy for each section
                if(results && results[0]) {
                    sectionObj.doc_api = results[0].doc_api_extensions.apiName;
                }

                docs = docs.concat(results);
            });

        } catch (e) {
            console.log("Reader collection error:".red, e);
        }
    };

    //load all plugins specified in the incoming configs
    var loadConfiguredPlugins = function () {

        console.section("verifying plugins");

        var pluginPromises = [];

        for(var i=0; i < options.plugins.length; i++) {
            ui_plugins_configs[options.plugins[i].id.replace('docular-plugin-', '')] = options.plugins[i].configs || {};
            pluginPromises.push( doc_utils.npmInstall(options.plugins[i].id) );
        }

        return Q.all(pluginPromises);
    };

    //get a list of node_modules and attach them to teh doc_apis object
    var loadDocAPIPlugins = function (files) {
        var rawDocAPIS = {};
        var pattern_apiFile = new RegExp(docularAPIPrefix + "([^\/]+)$",'i');

        //look for any api.js files within subdirectories of the doc_apis directory
        files.forEach(function(file) {

            var matches = pattern_apiFile.exec(doc_utils.normalizeFile(file));

            if(matches){
                try{
                    rawDocAPIS[matches[1]] = require(file + '/index.js');
                } catch(e) {
                    console.log("Failed to load document api:", e);
                }
            }
        });

        //let's also nest the doc_api value inside the object
        for(var docAPI in rawDocAPIS){
            rawDocAPIS[docAPI].apiName = docAPI;
        }

        //throw an error if the default doc api was not loaded
        if(!rawDocAPIS['doc']){
            console.log("FATAL ERROR: ".red + " Error loading default doc api 'doc'.".yellow, e);
        } else {

            //first set the default doc api
            var defaultDocAPI = doc_apis['doc'] = rawDocAPIS['doc'];

            //now we use the default doc api "doc" to start as a base class
            for(var docName in rawDocAPIS) {

                if(rawDocAPIS.hasOwnProperty(docName) && docName != 'doc') {
                    doc_apis[docName] = nodeExtend(true, {}, defaultDocAPI, rawDocAPIS[docName]);
                }

            }
        }
    };

    //load all ui plugins installed within node_modules
    var loadUIPlugins = function (files) {

        var isDocularPlugin = /^docular-plugin-([^\/\\]+)$/;

        //look for any api.js files within subdirectories of the doc_apis directory
        files.forEach(function(file) {

            var matches = isDocularPlugin.exec(doc_utils.normalizeFile(file));

            if(matches){
                try{
                    ui_plugins[matches[1]] = require(file + '/index.js');
                } catch(e) {
                    console.log("Failed to load docular plugin:", e);
                }
            }
        });
    };




    /*============ INITIALIZATION ============*/

    //first make sure all specified plugins are loaded
    Q.when(loadConfiguredPlugins(), function(content) {}).then(function (){

        //then make sure we have the target webapp directory created
        return writer.makeDir(ABS_WEBAPP, false);


    }).then(function () {

        //then copy over the required webapp files to the target webapp directory
        return writer.copyDir(ABS_WEBAPP_RESOURCES_FOLDER, ABS_WEBAPP);


    }).then(function () {

        //directories to ensure are created
        var directoriesToCreate = [
            REL_WEBAPP + '/documentation/',
            REL_WEBAPP + '/documentation/partials/',
            REL_WEBAPP + '/resources/docular-partials/',
            REL_WEBAPP + '/documentation/source-files/',
            REL_WEBAPP + '/controller/',
            REL_WEBAPP + '/configs/'
        ];

        //verify or create this list of directories
        var thisDirectory;
        var thisDirectoryExists;
        for(var i=0; i < directoriesToCreate.length; i++) {

            thisDirectory = directoriesToCreate[i];
            thisDirectoryExists = fs.existsSync(thisDirectory);

            if(!thisDirectoryExists) {
                fs.mkdirSync(thisDirectory);
            }

        }

        return true;

    //Once some supporting directories are created we should get get all plugins
    }).then(function(){

        //search for all node_modules that could be plugins and process them
        return Q.when(qfs.list(ABS_NODE_MODULES), function(files){
            return Q.when(qfs.list(ABS_GLOBAL_NODE_MODULES), function (globalModules) {
                var nodeModulePromises = [],
                    allFiles = globalModules.concat(files);

                nodeModulePromises.push(loadDocAPIPlugins(allFiles));
                nodeModulePromises.push(loadUIPlugins(allFiles));

                return Q.all(nodeModulePromises);
            });
        });


    //Next we need to process all the groups and normalize their api values
    }).then(function() {

        console.section("generating Docs");

        var sectionPromises = [];
        groups.forEach(function(group){

            //normalize visibility property
            group.visible = group.visible !== undefined ? group.visible : true;

            //set the default showSource value
            var showSource_default = group.showSource || false;

            group.sections.forEach(function(section){

                var showSource_section = section.showSource !== undefined ? section.showSource : showSource_default;
                sectionPromises.push(processGroup(section, group.groupId, doc_apis, showSource_section));
            });
        });

        return Q.all(sectionPromises);


    //then we need to make sure all group directories are created
    }).then(function(){

        console.section("generating partials directories for groups");

        var groupDirectory;
        var groupDirectoryExists;
        for(var groupId in groupIds) {

            groupDirectory = REL_WEBAPP + '/documentation/partials/' + groupId;
            groupDirectoryExists = fs.existsSync(groupDirectory);

            if(!groupDirectoryExists) {
                fs.mkdirSync(groupDirectory);
            }
        }

        console.section("generating partials directories for sections");

        var sectionDirectory;
        var sectionDirectoryExists;
        groups.forEach(function(group){
            group.sections.forEach(function(section){

                sectionDirectory = REL_WEBAPP + '/documentation/partials/' + group.groupId + '/' + section.id;
                sectionDirectoryExists = fs.existsSync(sectionDirectory);

                if(!sectionDirectoryExists) {
                    fs.mkdirSync(sectionDirectory);
                }

            });
        });

        return true;

    //then we have all the docs into the docs array so time to do some post processing
    }).then(function(){

        //now we merge child docs with their parentes in a nested list
        console.section("merging child docs with parent docs");
        try{
            doc_utils.merge(docs);
        } catch (e) {
            console.log("ERROR: ".red, "merging child docs",e);
        }
        //now that the children docs are nested within their parent docs, we want to write each doc to a partial file and get a promise for it
        console.section("generating partials");
        try {

            docs.forEach(function(doc){

                // this hack is here because on OSX angular.module and angular.Module map to the same file.
                var id = doc.id.replace('angular.Module', 'angular.IModule');
                doc.id = id;

                //call the doc.html() method on the doc to generate HTML to write to the partial for this particular set of documentation
                writer.output(ABS_WEBAPP + '/documentation/partials/' + doc.group + '/' + doc.section + '/' + id + '.html', doc.html());
            });

        } catch (e) {
            console.log("ERROR: ".red + " Generating partials ",e);
        }
        
        console.log("Generating support files");
        generateSupportingFiles();
        console.log("Generating webapp partials");
        generateWebappPartials();
        console.log("Generating config partials");
        generateConfigScript(baseUrl);
        console.log("Generation complete");
        return Q.all([]); //Backwards compat hack.
    // we need to copy over all UI resources from the doc apis and generate the index.html page with the doc_api resources injected
    }).then(function() {
        function resolvePluginFileName(relativeFilePath) {
            var absNodeModuleFile = path.join(ABS_NODE_MODULES, relativeFilePath),
                globalNodeModuleFile = path.join(ABS_GLOBAL_NODE_MODULES, relativeFilePath);

            if (fs.existsSync(path.resolve(absNodeModuleFile))) {
                return absNodeModuleFile;
            } else if (fs.existsSync(path.resolve(globalNodeModuleFile))) {
                return globalNodeModuleFile;
            } else {
                return relativeFilePath;
            }
        }

        //helper sort function
        var uiSort = function (a, b) {
            if(a.order < b.order) {
                return -1;
            } else if (a.order > b.order) {
                return 1;
            } else {
                return 0;
            }
        };

        //first create a helper object for ordering the order of UI resources to add
        var resourceOrder = {};
        for(var j=0; j < uiOrder.length; j++) {
            resourceOrder[uiOrder[j]] = j;
        }

        //first gather all the UI resources required for each doc_api
        var uiResourceList = [];
        var i, filePieces, sourceFileName, targetFileName;
        var largestOrder = 0;
        var getOrder = function (orderNum) {
            if(orderNum === undefined){
                largestOrder = largestOrder + 1;
                return largestOrder;
            } else {
                if (orderNum >= largestOrder) {largestOrder = orderNum;}
                return orderNum;
            }
        };

        for(var api in doc_apis) {
            if (doc_apis.hasOwnProperty(api)){
                doc_apis[api].ui_resources = doc_apis[api].ui_resources || {css:[],js:[]};
                doc_apis[api].ui_resources.css = doc_apis[api].ui_resources.css || [];
                doc_apis[api].ui_resources.js = doc_apis[api].ui_resources.js || [];

                for(i=0; i < doc_apis[api].ui_resources.css.length; i++){
                    sourceFileName = resolvePluginFileName(docularAPIPrefix + api + '/' + doc_apis[api].ui_resources.css[i]);
                    filePieces = sourceFileName.split('/');
                    targetFileName = filePieces[filePieces.length-1];
                    uiResourceList.push({
                        type:'css',
                        src: sourceFileName,
                        order: getOrder(resourceOrder[api] || 99)
                    });
                }
                for(i=0; i < doc_apis[api].ui_resources.js.length; i++){
                    sourceFileName = resolvePluginFileName(docularAPIPrefix + api + '/' + doc_apis[api].ui_resources.js[i]);
                    filePieces = sourceFileName.split('/');
                    targetFileName = filePieces[filePieces.length-1];
                    uiResourceList.push({
                        type:'js',
                        src: sourceFileName,
                        order: getOrder(resourceOrder[api] || 99)
                    });
                }
            }
        }

        //next process each plugin
        var pluginPromises = [];

        for(var plugin in ui_plugins) {
            if (ui_plugins.hasOwnProperty(plugin)){

                //grab all css and js from ui plugins
                ui_plugins[plugin].ui_resources = ui_plugins[plugin].ui_resources || {};
                ui_plugins[plugin].ui_resources.css = ui_plugins[plugin].ui_resources.css || [];
                ui_plugins[plugin].ui_resources.js = ui_plugins[plugin].ui_resources.js || [];

                for(i=0; i < ui_plugins[plugin].ui_resources.css.length; i++){
                    sourceFileName = resolvePluginFileName('docular-plugin-' + plugin + '/' + ui_plugins[plugin].ui_resources.css[i]);
                    filePieces = sourceFileName.split('/');
                    targetFileName = filePieces[filePieces.length-1];
                    uiResourceList.push({
                        type:'css',
                        src: sourceFileName,
                        order: getOrder()
                    });
                }
                for(i=0; i < ui_plugins[plugin].ui_resources.js.length; i++){
                    sourceFileName = resolvePluginFileName('docular-plugin-' + plugin + '/' + ui_plugins[plugin].ui_resources.js[i]);
                    filePieces = sourceFileName.split('/');
                    targetFileName = filePieces[filePieces.length-1];
                    uiResourceList.push({
                        type:'js',
                        src: sourceFileName,
                        order: getOrder()
                    });
                }

                //merge in default configs with the incoming plugin configs
                var defaultPluginConfigs = ui_plugins[plugin].configs || {};
                ui_plugins_configs[plugin] = nodeExtend(true, {}, defaultPluginConfigs, ui_plugins_configs[plugin]);

                //scan and process controllers if the plugin has them
                if(ui_plugins[plugin].controllers){

                    for(var controllerName in ui_plugins[plugin].controllers){

                        var controller = ui_plugins[plugin].controllers[controllerName];

                        //make a directory for this plugin
                        var phpControllerDir = REL_WEBAPP + '/controller/' + plugin + '/' + controllerName + '/';
                        var jsControllerDir = REL_LIB + '/nodeserver/controller/' + plugin + '/' + controllerName + '/';

                        //create node and php controller directories
                        writer.makeDir(jsControllerDir, true);
                        writer.makeDir(phpControllerDir, true);

                        //copy the node controller
                        var cPromise = Q.when(function(){

                            if(controller.node){
                                var nodeSource = resolvePluginFileName('docular-plugin-' + plugin + '/' + controller.node);
                                var nodeTarget = jsControllerDir + 'controller.js';

                                return qfs.read(nodeSource, 'b').then(function(content){
                                    return writer.output(nodeTarget,[content]);
                                });

                            } else {
                                return true;
                            }

                        }).then(function(){

                            //copy any php controller
                            if(controller.php){
                                var phpSource = resolvePluginFileName('docular-plugin-' + plugin + '/' + controller.php);
                                var phpTarget = phpControllerDir + 'controller.php';

                                return qfs.read(phpSource, 'b').then(function(content){
                                    return writer.output(phpTarget,[content]);
                                });
                            } else {
                                return true;
                            }

                        });

                        //add the promise to our controller list
                        pluginPromises.push(cPromise);
                    }
                }

            }
        }

        //create a controllerList to ease searching for controllers on the server
        var controllerList = {};
        for(var p in ui_plugins) {
            controllerList[p] = [];
            ui_plugins[p].controllers = ui_plugins[p].controllers || {};
            for(var c in ui_plugins[p].controllers) {
                controllerList[p].push(c);
            }
        }

        //now create the config files for the server and UI
        var serverConfigs = {};
        var clientConfigs = {};
        for(var pluginName in ui_plugins_configs) {
            serverConfigs[pluginName] = ui_plugins_configs[pluginName].server || {};
            clientConfigs[pluginName] = ui_plugins_configs[pluginName].client || {};
        }


        //now we generate the php config file the node config file and client config file
        var jsServerConfigsTarget = REL_LIB + '/nodeserver/configs/configs.js';

        writer.makeDir(REL_LIB + '/nodeserver/configs/');
        var jsServerConfigsPromise = writer.output(jsServerConfigsTarget,["exports.configs=" + JSON.stringify(serverConfigs)]);

        pluginPromises.push(jsServerConfigsPromise);


        var phpServerConfigsTarget = REL_WEBAPP + '/configs/configs.php';
        var phpServerConfigsPromise = writer.output(phpServerConfigsTarget,["<?php $configs= json_decode('" + JSON.stringify(serverConfigs) + "', true); ?>"]);

        pluginPromises.push(phpServerConfigsPromise);


        var phpControllerListTarget = REL_WEBAPP + '/controller/controllerList.php';
        var phpControllerListPromise = writer.output(phpControllerListTarget, ["<?php $controllerList = json_decode('" + JSON.stringify(controllerList) + "'); ?>"]);

        pluginPromises.push(phpControllerListPromise);


        var clientConfigsTarget = REL_WEBAPP + '/documentation/plugin-metadata.js';
        var clientConfigsPromise = writer.output(clientConfigsTarget,['DATA_CONFIGS=' + JSON.stringify(clientConfigs)]);

        pluginPromises.push(clientConfigsPromise);


        //lastly grab all css and js files from the configuration
        for(var i=0; i < options.javascript.length; i++) {
            uiResourceList.push({
                type:'js',
                src: options.javascript[i],
                order: getOrder()
            });
        }
        for(var i=0; i < options.css.length; i++) {
            uiResourceList.push({
                type:'css',
                src: options.css[i],
                order: getOrder()
            });
        }

        //the grunt config could have provided a ui resource order
        uiResourceList.sort(uiSort);

        //make sure controller promises are done
        return Q.when(pluginPromises).then(function(){

            //now write the index.html file out
            return Q.when(qfs.read(ABS_RESOURCES + '/templates/index.html', 'b'), function(content) {
                console.section("generating index.html page");

                return writer.output(
                    ABS_WEBAPP + '/index.html',
                    content.toString().replace(/#BASE_URL#/g, baseUrl)
                );
            });

        //then copy the resources from the doc_api location to the webapp
        }).then(function(){

            console.section("gathering all doc_api, plugin, and configured css and js");

            var cssContent = "";
            var jsContent = "";
            var baseURL = ABS_WEBAPP + "/";
            var copyPromises = [];

            //due to index reference problems in the for loop we create a function passback
            var copyFinished = function (resource) {
                return function (content) {
                    return {content: content.toString(), resource: resource};
                };
            };

            for(i = 0; i < uiResourceList.length; i++) {

                try{

                    fs.lstatSync(uiResourceList[i].src);
                    copyPromises.push(
                        Q.when(
                            qfs.read(uiResourceList[i].src, 'b'),
                            copyFinished(uiResourceList[i])
                        ).then(function(contentInfo){

                            if(contentInfo.resource.type === 'js') {
                                jsContent = jsContent + contentInfo.content + " ";
                            } else {
                                cssContent = cssContent + contentInfo.content + " " ;
                            }
                        })
                    );

                } catch (e) {
                    console.log("ERROR:".red + " copying ui resource", e);
                }
            }

            return Q.all(copyPromises).then(function(){

                writer.makeDir(REL_WEBAPP + '/resources/doc_api_resources/', true);

                var uiPromises = [];

                //create the concatenated js
                uiPromises.push(writer.output(
                    baseURL + '/resources/doc_api_resources/doc_api.js',
                    jsContent
                ));

                //create the concatenated js
                uiPromises.push(writer.output(
                    baseURL + '/resources/doc_api_resources/doc_api.css',
                    cssContent
                ));

                return Q.all(uiPromises);

            });
        });


    }).then(function() {

        //generate information on the groups for the UI
        generateGroupManifest(groups);

        var totalTime = now()-start;

        //and a quick report with some padding at the bottom
        console.section("generating report");
        console.log('DONE!'.green + ' Generated ' + (docs.length + '').grey + ' pages in ' + (totalTime + '').grey + ' ms. Partials per second : ' + (Math.round(docs.length/(totalTime/1000)) + '').grey);
        console.log('');

        endGenerateDocumentation();

    });

};

//and the exported gen-docs api
module.exports = {
    generate: generate,
    workingWebappFolder : function (docular_webapp_target) {
        var ABS_SCRIPTS = __dirname;
        var ABS_LIB = path.resolve(ABS_SCRIPTS + '/..');
        var ABS_DEFAULT_GENERATED_WEBAPP = ABS_LIB + '/generated/';
        return docular_webapp_target ? path.resolve(process.cwd() + '/' + docular_webapp_target) : path.relative(process.cwd(), ABS_DEFAULT_GENERATED_WEBAPP);
    }
};

