/**
 * Based off of Angular.js original implementation of gen-docs.js
 * Documentation code licensed under CC BY 3.0
 * http://creativecommons.org/licenses/by/3.0/
 */

/**
 * @doc module
 * @name docular
 * @description This module contains all the logic for the workflow of generating
 * partials and front end resources for display of docular documentation
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
 * @method generate
 */


/*============ DEPENDENCIES ============*/

var reader = require('./reader.js'),
    writer = require('./writer.js'),
    doc_utils = require('./doc_utils.js'),
    SiteMap = require('./SiteMap.js').SiteMap,
    appCache = require('./appCache.js').appCache,
    Q = require('qq'),
    qfs = require('q-fs'),
    fs = require('fs'),
    path = require('path'),
    nodeExtend = require('node.extend'),
    colors = require('colors');


process.on('uncaughtException', function(err) {
    console.error(err.stack || err);
});


/*============ UTILITY FUNCTIONS ============*/

var now = function () { return new Date().getTime(); };
var noop = function () {};

console.section = function (message) {
    console.log("");
    console.log("-------- " .grey + message.grey + " --------".grey);
    console.log("");
};


/*=========== PRIVATE VARIABLES/FUNCTIONS ===========*/

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

var angularGroup = {
    groupTitle: 'Angular Docs', //this is what will show up in the UI for this group
    groupId: 'angular', //to determine what directory these docs will go into and used as an identifier
    groupIcon: 'icon-book', //icon to use when relevant and within this group of documentation
    descr: 'Description', //@todo figure out how to use this?
    sections: [
        {
            id: "api",
            title:"Angular API",
            scripts: ["lib/angular/js"]
        },
        {
            id: "guide",
            title: "Developers Guide",
            docs: ["lib/angular/ngdocs/guide"]
        },
        {
            id: "tutorial",
            title: "Tutorial",
            docs: ["lib/angular/ngdocs/tutorial"]
        },
        {
            id: "misc",
            title: "Overview",
            docs: ["lib/angular/ngdocs/misc"]
        }
    ]
};

var docularGroup = {
    groupTitle: 'Docular Doc Generation', //this is what will show up in the UI for this group
    groupId: 'docular', //to determine what directory these docs will go into and used as an identifier
    groupIcon: 'icon-book', //icon to use when relevant and within this group of documentation
    descr: 'Description', //@todo figure out how to use this?
    sections: [
        {
            id: "docular",
            title:"Docular",
            scripts: [
                "lib/scripts/gen-docs.js",
                "lib/scripts/reader.js",
                "lib/scripts/writer.js",
                "lib/scripts/Doc.js"
            ],
            docs: [
                "lib/scripts/docs"
            ]
        },
        {
            id: "docularext",
            title:"Docular Extensions",
            scripts: []
        }
    ]
};


/*============ PUBLIC generate function ============*/

var generate = function (options, callBack) {

    /*============ CONFIGURATION SETUP ============*/

    var groups = options.groups || [];
    var uiOrder = options.docAPIOrder || [];
    var doc_apis_path = '/lib/doc_apis';
    var baseUrl = options.baseUrl || false;

    var showAngularDocs = options.showAngularDocs || false;
    var showDocularDocs = options.showDocularDocs || false;

    if(showAngularDocs){addLocalGroup(angularGroup, groups);}
    if(showDocularDocs){addLocalGroup(docularGroup, groups);}


    /*============ PRIVATE METHODS / VARIABLES ============*/

    var start = now();
    var docs = [];
    var groupIds = {};

    var pattern_apiFile = new RegExp(doc_apis_path + "/(.+)/([^/]+)$",'i');
    var doc_apis = {};

    var endGenerateDocumentation = function () {
        callBack();
        return;
    };

    var getRelativePath = function (absPath) {
        return (absPath.split(process.cwd()))[1];
    };

    //setup relative paths to the current working directory
    var ABS_SCRIPTS = __dirname;
    var ABS_LIB = path.resolve(ABS_SCRIPTS + '/..');
    var ABS_BASE = path.resolve(ABS_LIB + '/..');
    var ABS_RESOURCES =  ABS_LIB + '/resources'; //need to back out one directory back to lib
    var ABS_WEBAPP = ABS_LIB + '/webapp';
    var ABS_DOC_APIS = ABS_BASE + doc_apis_path;

    var REL_SCRIPTS = getRelativePath(ABS_SCRIPTS);
    var REL_LIB = getRelativePath(ABS_LIB);
    var REL_BASE = getRelativePath(ABS_BASE);
    var REL_RESOURCES = getRelativePath(ABS_RESOURCES);
    var REL_WEBAPP = getRelativePath(ABS_WEBAPP);
    var REL_DOC_APIS = getRelativePath(ABS_DOC_APIS);

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
        writeFutures.push(writer.output(ABS_WEBAPP + '/documentation/docs-metadata.js',
            ['DOC_DATA=', JSON.stringify(doc_metadata).replace(/\{/g, '\n{'), ';']
        ));

        // We need to generate the group information for the UI
        var group_metadata = groups;
        writeFutures.push(writer.output(ABS_WEBAPP + '/documentation/groups-metadata.js',
            ['GROUP_DATA=', JSON.stringify(group_metadata).replace(/\{/g, '\n{'), ';']
        ));

        // Lastly we should send out doc_apis information for the UI
        // This information is used by the UI to sort sections in modules and provide links to documentation
        writeFutures.push(writer.output(ABS_WEBAPP + '/documentation/layout-metadata.js',
            ['LAYOUT_DATA=', JSON.stringify(getLayoutMetaData()).replace(/\{/g, '\n{'), ';']
        ));

        // @todo run through these that were used in original ngdocs and port over the functionality
        // writeFuture.push(writer.output('sitemap.xml', new SiteMap(docs).render()));
        // writesFuture.push(writer.output('robots.txt', 'Sitemap: http://docs.angularjs.org/sitemap.xml\n'));
        // writesFuture.push(writer.output('appcache.manifest',appCache()));
        // writesFuture.push(writer.copyTemplate('.htaccess')); // will be rewritten, don't symlink
    };

    var generateSetBaseUrlScript = function (writeFutures, baseUrl) {

        // This script houses instructions to set the base url for Angular
        if(baseUrl) {
            writeFutures.push(writer.output(ABS_WEBAPP + '/documentation/docular-configuration.js',
                ["addTag('base', {href: '" + baseUrl + "'});"]
            ));
        } else {
            writeFutures.push(writer.output(ABS_WEBAPP + '/documentation/docular-configuration.js',[""]));
        }
    };

    //main logic to intialize the documentation generation for a particular documentation group
    var processGroup = function (sectionObj, groupId, doc_apis) {

        console.log('Extracting ' + groupId.cyan + ' Documentation For Section "' + sectionObj.id.cyan + '"...');

        //keep track of all groupIds so we can create directories for each of them later
        groupIds[groupId] = true;

        try {

            return reader.collect(

                {
                    group: groupId,
                    section: sectionObj.id,
                    scripts: sectionObj.scripts,
                    docs: sectionObj.docs
                },

                doc_apis

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


    /*============ INITIALIZATION ============*/

    //Once the partial directory is created we should get the doc_apis
    writer.makeDir(REL_WEBAPP + '/documentation/partials/', true).then(function(){

        //first determine what the default doc api will be
        var defaultDocAPI = {};
        try {
            defaultDocAPI = require('../doc_apis/doc/api.js');
        } catch (e) {
            console.log("WARNING: ".yellow + " Error loading default doc api.js.".grey, e);
        }

        //append the default doc_api to the doc_apis
        doc_apis['doc'] = defaultDocAPI;

        //then search for other dropped-in apis
        return Q.when(qfs.listTree(ABS_DOC_APIS), function(files){

            //look for any api.js files within subdirectories of the doc_apis directory
            files.forEach(function(file) {

                var matches = pattern_apiFile.exec(doc_utils.normalizeFile(file));

                if(matches && matches[2] == "api.js"){
                    try{
                        doc_apis[matches[1]] = nodeExtend(true, {}, defaultDocAPI, require(file));
                    } catch(e) {
                        console.log("Failed to load document api:", e);
                    }
                }
            });

            //let's also nest the doc_api value inside the object
            for(var docAPI in doc_apis){
                doc_apis[docAPI].apiName = docAPI;
            }

        });

    //Next we need to process all the groups
    }).then(function() {

        console.section("generating documentation objects");

        var sectionPromises = [];
        groups.forEach(function(group){
            group.sections.forEach(function(section){
                sectionPromises.push(processGroup(section, group.groupId, doc_apis));
            });
        });

        return Q.deep(sectionPromises);


    //then we need to make sure all group directories are created
    }).then(function(){

        console.section("generating partials directories for groups");

        var folderPromises = [];
        for(var groupId in groupIds) {
            folderPromises.push(writer.makeDir(REL_WEBAPP + '/documentation/partials/' + groupId, true));
        }

        //send back deep promises
        return Q.deep(folderPromises);


    }).then(function(){

        console.section("generating partials directories for sections");

        var folderPromises = [];
        groups.forEach(function(group){
            group.sections.forEach(function(section){
                folderPromises.push(writer.makeDir(REL_WEBAPP + '/documentation/partials/' + group.groupId + '/' + section.id, true));
            });
        });

        //send back deep promises
        return Q.deep(folderPromises);

    //then we have all the docs into the docs array so time to do some post processing
    }).then(function(){

        //now we merge child docs with their parentes in a nested list
        console.section("merging child docs with parents");
        try{
            doc_utils.merge(docs);
        } catch (e) {
            console.log("ERROR: ".red, "merging child docs",e);
        }

        var filePromises = [];

        //now that the children docs are nested within their parent docs, we want to write each doc to a partial file and get a promise for it
        console.section("generating partials");

        try {

            docs.forEach(function(doc){

                // this hack is here because on OSX angular.module and angular.Module map to the same file.
                var id = doc.id.replace('angular.Module', 'angular.IModule');
                doc.id = id;

                //call the doc.html() method on the doc to generate HTML to write to the partial for this particular set of documentation
                filePromises.push(writer.output(ABS_WEBAPP + '/documentation/partials/' + doc.group + '/' + doc.section + '/' + id + '.html', doc.html()));
            });

        } catch (e) {
            console.log("ERROR: ".red + " Generating partials ",e);
        }

        //add the rest of the other expected files which includes javascript objects for all the docs for the anglur docs app to use
        console.section("generating keyword data");
        generateSupportingFiles(filePromises);
        generateSetBaseUrlScript(filePromises, baseUrl);

        //send back deep promises
        return Q.deep(filePromises);


    // we need to copy over all UI resources from the doc apis and generate the index.html page with the doc_api resources injected
    }).then(function() {

        //helper sort function
        var uiSort = function (a, b) {
            if(a.order > b.order) {
                return -1;
            } else if (a.order < b.order) {
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

        for(var api in doc_apis) {
            if (doc_apis.hasOwnProperty(api)){
                doc_apis[api].ui_resources = doc_apis[api].ui_resources || {css:[],js:[]};
                doc_apis[api].ui_resources.css = doc_apis[api].ui_resources.css || [];
                doc_apis[api].ui_resources.js = doc_apis[api].ui_resources.js || [];

                for(i=0; i < doc_apis[api].ui_resources.css.length; i++){
                    sourceFileName = ABS_DOC_APIS + '/' + api + '/' + doc_apis[api].ui_resources.css[i];
                    filePieces = sourceFileName.split('/');
                    targetFileName = filePieces[filePieces.length-1];
                    uiResourceList.push({
                        type:'css',
                        src: sourceFileName,
                        order: resourceOrder[api] || 99
                    });
                }
                for(i=0; i < doc_apis[api].ui_resources.js.length; i++){
                    sourceFileName = ABS_DOC_APIS + '/' + api + '/' + doc_apis[api].ui_resources.js[i];
                    filePieces = sourceFileName.split('/');
                    targetFileName = filePieces[filePieces.length-1];
                    uiResourceList.push({
                        type:'js',
                        src: sourceFileName,
                        order: resourceOrder[api] || 99
                    });
                }
            }
        }

        //the grunt config could have provided a ui resource order
        uiResourceList.sort(uiSort);

        //write the index.html file
        return Q.when(qfs.read(ABS_RESOURCES + '/templates/index.html', 'b'), function(content) {

            console.section("generating index.html page");

            return writer.output(
                ABS_WEBAPP + '/index.html',
                content.toString()
            );


        //then copy the resources from the doc_api location to the webapp
        }).then(function(){

            console.section("ordering and concatenating doc_api css and js");

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

            return Q.deep(copyPromises).then(function(){

                return writer.makeDir(REL_WEBAPP + '/resources/doc_api_resources/', true).then(function(){

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

                    return Q.deep(uiPromises);

                });

            });
        });


    }).then(function(content) {

        //generate information on the groups for the UI
        generateGroupManifest(groups);

        var totalTime = now()-start;

        //and a quick report
        console.section("generating report");
        console.log('DONE. Generated ' + (docs.length + '').grey + ' pages in ' + (totalTime + '').grey + ' ms. Partials per second : ' + (Math.round(docs.length/(totalTime/1000)) + '').grey);


    });

};


module.exports = {
    generate: generate
};

