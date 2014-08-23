/*
 * Workflow:
 *      1. Load extensions
 *      2. Find all files
 *      3. Parse file content
 *      4. Write source files
 *      5. Write doc partials
 *      6. Copy web resources
 *      7. Create configuration
 */

var nodeExtend = require('node.extend');
var Q = require('q');
var Generator = require('./core/generator');
var util = require('util');
var defaultOptions = {

    groups : [], //a list of groups which will contain paths to documentation that needs parsing

    baseUrl: '/', //where is the root for this documentation app?

    docAPIOrder: ['doc', 'angular'], //order of doc_apis CSS and JS in the UI
    
    javascript: [
        'resources/libraries/jquery/jquery.min.js',
        'resources/libraries/angular/angular.js',
        'resources/libraries/angular/angular-route.min.js',
        'resources/libraries/angular/ui-bootstrap.min.js',
        'resources/libraries/angular/ui-bootstrap-tpls.min.js',
        'resources/libraries/marked/marked.js',
        
    ], //you can specify an ordered list of scripts to be loaded into the UI
    
    css: [
        'resources/libraries/highlight/styles/github.css'
    ], //you can specify an ordered list of css files to be loaded into the UI
    
    angularModules: [],
    
    dependencies: [
        {package: 'jquery', version: '1.10.2', files: ['jquery.min.js'], savedir: 'jquery'},
        {package: 'angular-route', version: '1.2.22', files: ['angular-route.min.js'], savedir: 'angular'},
        {package: 'angular-animate', version: '1.2.22', files: ['angular-animate.min.js'], savedir: 'angular'},
        {package: 'angular-cookies', version: '1.2.22', files: ['angular-cookies.min.js'], savedir: 'angular'},
        {package: 'angular-loader', version: '1.2.22', files: ['angular-loader.min.js'], savedir: 'angular'},
        {package: 'angular-mocks', version: '1.2.22', files: [['angular-mocks.js', 'angular-mocks.min.js']], savedir: 'angular'},
        {package: 'angular-resource', version: '1.2.22', files: ['angular-resource.min.js'], savedir: 'angular'},
        {package: 'angular-sanitize', version: '1.2.22', files: ['angular-sanitize.min.js'], savedir: 'angular'},
        {package: 'angular-touch', version: '1.2.22', files: ['angular-touch.min.js'], savedir: 'angular'},
        {package: 'angular', version: '1.2.22', files: ['angular.js'], savedir: 'angular'},
        //Bootstrap and font awesome are treated differently due to being included in the css
        //compilation step.
        {package: 'bootstrap', version: '3.2', files: []},
        {package: 'fontawesome', version: '4.1.0', files: []},
        {package: 'angular-bootstrap', version: '0.11.0', files: [
            'ui-bootstrap.min.js',
            'ui-bootstrap-tpls.min.js'
        ], savedir: 'angular'},
        {package: 'marked', version: '0.3.2', files: [['lib/marked.js', 'marked.js']], savedir: 'marked'}
    ],
    
    languages: [
        'css',
        'scss',
        'markdown',
        'ruby',
        'java',
        'php',
        'xml',
        'sql',
        'bash'
    ],
    
    plugins: [], //an array of docular plugins 
    
    examples: {
        autoBootstrap: true,
        include: {
            angular: true,
            js: [],
            css: []
        }
    },
    showAngularDocs: false, //do you want to have angular's docs parsed and shown in the UI?
    showDocularDocs: false, //do you want to have docular's docs parsed and shown in the UI?

    analytics: {account:false, domainName:false}, //optional turn on google analytics
    discussions: {shortName:false, url:false, dev: false}, //optional turn on disqus

    docular_partial_home: false, //you can provide a url to partial to be used on the homepage, if not defined it will pull in a default
    docular_partial_navigation: false, //you can provide a url to partial to be injected in the navigation
    docular_partial_footer: false, //you can provide a url to partial to be injected as the footer
    docular_partial_group_index: false, //you can provide a url to partial to be used on as the root page of a group, if not defined it will pull in a default
    docular_partial_example: false,
    docular_partial_404: false,
    useHtml5Mode: true,
    docular_webapp_target : './docular_generated' // External webapp folder for static documentation
};

function generate(options) {
    var scripts = defaultOptions.javascript.splice(0, defaultOptions.javascript.length - 1);
    var css = defaultOptions.css.splice(0, defaultOptions.css.length - 1);
    options = nodeExtend(true, defaultOptions, options);
    
    options.javascript = scripts.concat(options.javascript);
    options.css = css.concat(options.css);
    
    var generator = new Generator(options);
    
    var promise = generator.start();
    promise.catch(function (err) {
//        console.log(util.inspect(err, { showHidden: true, depth: null }))
        console.log(err.stack);
    });
    return promise;
}

module.exports = {
    generate: generate,
    
    /**
     * Unsure what this is all about.
     */
    workingWebappFolder : function (docular_webapp_target) {
        var ABS_SCRIPTS = __dirname;
        var ABS_LIB = path.resolve(ABS_SCRIPTS + '/..');
        var ABS_DEFAULT_GENERATED_WEBAPP = ABS_LIB + '/generated/';
        return docular_webapp_target ? path.resolve(process.cwd() + '/' + docular_webapp_target) : path.relative(process.cwd(), ABS_DEFAULT_GENERATED_WEBAPP);
    }
};