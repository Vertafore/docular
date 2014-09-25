@doc overview
@name index
@description

[![NPM version](https://badge.fury.io/js/docular.svg)](http://badge.fury.io/js/docular)

#New Beta Version 
Version 0.8.x is out. The API at this point should be considered stable. 

#Docular

Extensible Documentation Generation Based on AngularJS's Documentation Generation

#Grunt Plugin For Docular: "grunt-docular"

Docular is best used as a dependency by the grunt-docular plugin.
The grunt-docular plugin exposes the api in a simple fashion and helps you include documentation tasks in your grunt-based build process.

## Getting Started

```shell
npm install grunt-docular
```
One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-docular');
```

## The "docular" task

### Overview
In your project's Gruntfile, add a section named `docular` to the data object passed into `grunt.initConfig()`.

```js

grunt.initConfig({
    docular: {
        useHtml5Mode: false, //Use angular's html5 mode? true/false.
        docular_webapp_target: '/docs', //The place where the docs will be generated
        showAngularDocs: true,
        showDocularDocs: true,
        examples: {}, //instructions for how to run the sandboxed examples
        groups: [] //groups of documentation to parse
    }
})

```

### Options
``baseUrl`` (Type: `string`, default: `""`): Angular uses the <base> tag to designate the baseUrl for an app. This helps resolve routes and location through the $location service

``useHtml5Mode`` (Type: `boolean`, default: `false`): Whether or not to use angular's html5 mode. The html5 mode requires a specialized hosting setup, which may be too much work for simply serving documentation.

``docular_webapp_target`` (Type: `string`): Where to put the generated documentation files. Serve this folder via a webserver. 

``examples`` (Type: `object`): Instructions to docular as to how to serve up example code. 

``examples.autoBootstrap`` (Type: `boolean`, default: `true`): Automatically bootstrap the example. This isn't desired if your code uses something like requirejs where the dependencies may still be loading at the time angular is done loading.

``examples.include`` (Type: `object`): An object that will contain all of the items that are to be included in the sandbox.

``examples.include.angular`` (Type: `boolean`, default: `true`): Should angular be loaded automatically? Specify this as `false` if angular is wrapped in other code you are giving to the example sandbox.

``examples.include.js`` (Type: `array`): A list of JS files that should be included in the example sandboxes.

``examples.include.css`` (Type: `array`): A list of CSS files that should be included in the example sandboxes.

``showAngularDocs`` (Type: `boolean` or `string`, default: `false`): If you'd like the angular documentation included with the app, either specify `true` (which will grab the latest master copy of angular) or the version number that you'd like downloaded. For example, `'1.2.22'`. 

``showDocularDocs`` (Type: `boolean`, default: `false`): Setting this to true will have docular parse and render the documentation for docular.

``discussions`` (Type: `object`, default: `null`): If you want Disqus enabled on your documentation site, specify this argument as an object with the key `shortName` set to be the shortened name that Disqus gives you. For example, `{shortName: 'mydocsite'}`

``analytics`` (Type: `object`, default: `null`): If you want Google Analytics enabled on your documentation site, specify this argument as an object with the key `account` set to be the account id that is given to you by Google. For example, `{account: 'UA_38892'}`

``groups`` (Type: `array [group object]`, default: `[]`): This is an array of group objects. Groups have their own api, but generally consists of some metadata and lists of files that need to be parsed and rendered for documentation. 

### Groups
Group configurations for Angular and the docular documentation are stored and pushed into all groups if you set the showAngularDocs and showDocularDocs options to true. These configurations are identical to what you would use to configure docular to parse and render your own documentation.

Here is the group configuration for Angular:
```js
{
    groupTitle: 'Angular Docs',
    groupId: 'angular',
    groupIcon: 'icon-book',
    groups: [
        {
            id: "api",
            title:"API's",
            files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/src/**/*.js'])
        },
        {
            id: "guide",
            title: "Guide",
            groupIcon: 'book',
            files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/guide/**/*.ngdoc'])
        },
        {
            id: "misc",
            title: "Misc",
            groupIcon: 'empire',
            files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/misc/**/*.ngdoc'])
        },
        {
            id: "tutorial",
            title: "Tutorial",
            groupIcon: 'life-ring',
            files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/tutorial/**/*.ngdoc'])
        }
    ]
}
```
### Group Object Attributes
``groupTitle`` (required) `string` : The string value that will propogate up to the UI as the name of the page.

``groupId`` (Type: `string`, required) : This will be the id used to determine where documentation belongs within the group hierarchy. 

``groupIcon`` (Type: `string`, default: "book") : This is an optional attribute that determines the class put on the icon attribute in the UI. Pick an icon from the [Font Awesome](http://fortawesome.github.io/Font-Awesome/icons/) list, minus the 'fa-' part. For example, `'bus'`. Or, `'cc-visa'`. 

``groups`` (Type: `array [group object]`, default: []) : Subgroups of this group. 

``files`` (Type: `array [file paths]`, default: []) : An array of files that should be parsed. You should use the result from grunt.file.expand.

``examples`` (Type: `object`) : Any overrides that you need to set on the examples object. For instance, if all of your documentation except one group needs to be bootstrapped by the documentation, you can set `{autoBootstrap: false}` as the value for the `examples` key in that one group.

``docs`` and ``scripts`` are automatically merged into the ``files`` array to help with backwards compatibility. ``id`` and ``title`` are automatically renamed for the same reason.

## A complete example

```js

grunt.initConfig({
    docular: {
        useHtml5Mode: false,
        docular_webapp_target: 'target/docs',
        showAngularDocs: '1.2.15',
        groupTitle: 'My Docs',
        /** The `examples` tag here is for a slightly more complicated setup - feel free to ignore it **/
        examples: {
            autoBootstrap: false, //In this case, our code is bootstrapped by a file we're loading in manually - start.js
            include: {
                angular: false,
                js: [
                    './doc_files/build.standalone.compiled.js', //Our fully compiled source, ready to show working examples in the docs
                    './doc_files/start.js' //Code we want to use to start up our examples
                ],
                css: [
                    './doc_files/standalone.css' //Some styles specific to our code that we want loaded in.
                ]
            }
        },
        groups: [
            {
                groupTitle: 'Mobile Controls',
                groupId: 'controls',
                groupIcon: 'book',
                groups: [
                    {
                        id: "api",
                        title:"API's",
                        files: grunt.file.expand(['src/**/*.js', '!src/**/*.spec.js', '!src/**/lib/**/*.js'])
                    }
                ]
            },
            {
                groupTitle: 'Styleguide',
                groupId: 'styleguide',
                groupIcon: 'beer',
                groups: [
                    {
                        id: "styleguide",
                        title: "Basic Styles",
                        files: grunt.file.expand(['src/main/resources/sass/**/*.ngdoc'])
                    }
                ]
            }
        ],
        analytics: {
            account: 'UA_382893289'
        },
        discussions: {
            shortName: 'mydisqusshortname'
        }
    },
    
    /** Once again, this is for a slightly more complicated setup where your examples
        require additional files to be copied in **/
    copy: {
        docFiles: {
            options: {
                mode: true
            },
            files: [
                {cwd: "doc_files", src: '**', expand: true, nonull: true, dest: 'target/docs/doc_files'} //Would copy all contents of 'doc_files' into our documentation folder
            ]
        }
    }
});

grunt.loadNpmTasks('grunt-docular');

grunt.registerTask('docs', ['docular', 'copy:docFiles']);

```

Using this setup, you would run ``grunt docs``. This would run docular, then copy the files for the running of examples. Alternatively if you 
don't need to copy any files in for example running, just run ``grunt docular``. 
