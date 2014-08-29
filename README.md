@doc overview
@name index
@description

#New Beta Version 
Version 0.8.x is out. **There are some major breaking changes from the previous versions:**

1. Most plugins are likely to no longer work. There were only two that I was aware of, so I felt
that the benefits of doing a core rewrite outweighed the breakages that would occur. A more concrete plugin
api will be implemented after this release.
2. The "pager" directive used by docular had to be renamed to "docular-pager" due to a
conflict with the updated version of angular-bootstrap.
3. Example code is now sandboxed in an iframe when run. This means that in order to add custom code
to the application to support these examples you must either include the code in the new
"examples" section in the configuration, or you must provide an alternative "example.html" path
as the docular_partial_example parameter in the configuration.

#Docular

> Extensible Documentation Generation Based on AngularJS's Documentation Generation

#Grunt Plugin For Docular: "grunt-docular"

> Docular is best used as a dependency by the grunt-docular plugin.
> The grunt-docular plugin exposes the api in a simple fashion and helps you include documentation tasks in your grunt-based build process.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-docular --save-dev
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
``baseURL`` (Type: `string`, default: `""`): Angular uses the <base> tag to designate the baseUrl for an app. This helps resolve routes and location through the $location service

``useHtml5Mode`` (Type: `boolean`, default: `false`): Whether or not to use angular's html5 mode. The html5 mode requires a specialized hosting setup, which may be too much work for simply serving documentation.

``docular_webapp_target`` (Type: `string`): Where to put the generated documentation files. Serve this folder via a webserver. 

``examples`` (Type: `object`): Instructions to docular as to how to serve up example code. 

``examples.autoBootstrap`` (Type: `boolean`, default: `true`): Automatically bootstrap the example. This isn't desired if your code uses something like requirejs where the dependencies may still be loading at the time angular is done loading.

``examples.include`` (Type: `object`): An object that will contain all of the items that are to be included in the sandbox.

``examples.include.angular`` (Type: `boolean`, default: `true`): Should angular be loaded automatically? Specify this as `false` if angular is wrapped in other code you are giving to the example sandbox.

``examples.include.js`` (Type: `array`): A list of JS files that should be included in the example sandboxes.

``examples.include.css`` (Type: `array`): A list of CSS files that should be included in the example sandboxes.

``showAngularDocs`` (Type: `boolean`, default: `false`): The angular source is included in the docular package so it can be parsed and rendered to both help test the docular package and provide angular documentation for apps that use it.

``showDocularDocs`` (Type: `boolean`, default: `false`): Setting this to true will have docular parse and render the documentation for the docular plugin itself. This is helpful for developers to understand the default doc api (docular-doc-api-doc) to aid them in creating their own docular api extensions.

``docAPIOrder`` (Type: `array [string]`, default: `['doc', 'angular']`): For each docular api extension we need to know the order to include the UI scripts and CSS due to overrides etc..

``groups`` (Type: `array [group object]`, default: `[]`): This is an array of group objects. Groups have their own api, but generally consists of some metadata and lists of files that need to be parsed and rendered for documentation. For more check out

### Groups
Group configurations for Angular and the docular documentation are stored and pushed into all groups if you set the showAngularDocs and showDocularDocs options to true. These configurations are identical to what you would use to configure docular to parse and render your own documentation.

Here is the group configuration for Angular:
```js
{
    groupTitle: 'Angular Docs', //Title used in the UI
    groupId: 'angular', //identifier and determines directory
    groupIcon: 'icon-book', //Icon to use for this group
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
}
```
### Group Object Attributes
``groupTitle`` (required) `string` : The string value that will propogate up to the UI as the name of the tab

``groupId`` (required) `string` : This will be the id used globally within the code and as the directory for this code. It will show in the URL for these docs ie 'http:/localhost:8000/documentation/<groupId>/blah blah'.

``groupIcon`` `(default="icon-book")` string : This is an optional attribute that determines the class put on the icon attribute in the UI. This comes from Twitter Boostrap. See [Twitter Boostrap](http://twitter.github.io/bootstrap/base-css.html#images)

``sections`` (required) `array [sectionObject]` : This determines the different sections of documentation within your group. You can see the Angular example above in how it's documentation is broken up into sections that make logical sense.

``sectionObject.id`` (required) `string` : This will be the id used globally within the code and will be the identifier in the url for documentation within this section ie 'http:/localhost:8000/documentation/<groupId>/<sectionObject.id>/blah blah'.

``sectionObject.title`` (required) `string` : The title that will show in the tab drop downs for this section of documentation

``sectionObject.scripts`` (optional) `array [string]` : The scripts array is an array of paths to folders and files that contain scripts (really of any kind... could probably be php or java or whatever although that has not been tested). These files will be parsed for documentation that resides within comments (within /** and *). The end of a comment will conclude the end of a complete documentation entry.

``sectionObject.docs`` (optional) `array [string]` : The docs array is an array of paths to folders and files that contain documentation. These files will be parsed assuming that the docs here are not within comments. So this is basically a text file full of docs. This is a great way to provide supplimental documentation, tutorials, guides, and definitions for types etc..

