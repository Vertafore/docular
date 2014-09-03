#Configuration

Docular has a small set of configuration options that you should be familiar with. When you configure docular, you
are actually configuring the base 'group'. Each 'group' accepts the same parameters, but some are only respected
on the base group. 

Docular is also split up into plugins. The primary codebase is responsible for simply organizing and standardizing the documentation that is generated from the plugins. By default grunt-docular requires docular-ng-plugin, so we're going to list those plugin parameters below as well. 

All plugin parameters are part of the group object, unless otherwise specified.

##Docular parameters

Required parameters are in **bold**.

| Param | default | description |
|------|------|------|
| analytics         | ```null``` | Information regarding your Google Analytics account. This should be an object with an ```account``` parameter containing your Google Analytics account. For example, "UA_3838383". |
| angularModules    | ```empty array``` | Any extra modules that should be loaded by the Docular app. This isn't for examples - this is for the actual application load. Useful if you want to add plugins that add functionality to the core application |
| baseUrl           | ```/``` | Where is the root for the documentation application? For example, if you were hosting docular's output on your site under '/docs', you would want to set this parameter to '/docs' to ensure that the app loads correctly. |
| dependencies      | ```array of dependencies``` | An array of dependencies that will be loaded by Bower and copied into the application's library folder. Each dependency is an object that looks like ```{package: 'BowerPackageName', version: 'version', files: ['singleFileToCopy', ['fileSrc', 'fileDestWithinTheSavedir']], savedir: 'FolderInsideLibrariesWhereThisShouldBeSaved'}```. The dependencies you specify will be concatenated to the already existing dependency array. |
| discussions       | ```null``` | Information regarding your disqus account for showing disqus discussions on each page. This should just be an object with a ```shortName``` parameter containing the shortened name of your site given to you by disqus.|
| docular_webapp_target | ```null``` | Where should the documentation generated from Docular be stored? If not specified, this will store the documentation in the Docular node module, which is likely not what you want. |
| files             | ```null``` | An array of files that need to be parsed. The best way of providing this is by setting this value to the return of ```grunt.file.expand```. For example, ```files: grunt.file.expand(['public/**/*.js', '!public/**/*.spec.js', '!public/**/lib/**/*.js'])```. That example would include all js files that do not end in .spec.js, and do not live in any folder called 'lib' |
| groupIcon         | ```code``` | Pick an icon from the [Font Awesome icon library](http://fortawesome.github.io/Font-Awesome/icons/). Just use the part after the ```fa-```. For example, ```coffee```. Not ```fa-coffee```.|
| **groupId**       | ```empty string``` | The ID of the group you have created. This should be unique, as it is used to help the program find documentation that is related to one another. |
| groups            | ```empty array``` | An array of group objects that are children to this group object.|
| groupTitle        | ```empty string``` | The title of the group you have created. Use a human-readable string |
| javascript        | ```array of dependencies``` | If you need any extra javascript files added to the doc on load, set them here. They will be concatenated to the core Docular files |
| languages         | ```array of default langauges``` | Specify additional languages from the [highlight.js](https://highlightjs.org/) library to be loaded if you have need. The defaults are css, scss, markdown, ruby, java, php, xml, sql, and bash. Any you add will be concatenated to the default list. |
| plugins           | ```array``` | If you want to specify more plugins, set this to be an array containing the result from requiring the plugin. For example, ```plugins: [require('docular-ng-plugin')]```. By default, grunt-docular sets this to contain a reference to docular-ng-plugin and docular-markdown-plugin. If you override this parameter it is your responsibility to provide all plugins you deem necessary to generate your documentation. |
| showAngularDocs   | ```false``` | Should Angular docs be included in the output? If you set this to ```true```, Docular will fetch the latest Angular from GitHub. If you set this to a version (i.e. ```1.2.15```), Docular will fetch that version and parse it for documentation. This way you can have the Angular docs of the version you are using with your API documentation. |
| showDocularDocs   | ```false``` | Should Docular docs be included in the output? If so, they will be listed under a 'Docular' tab. |
| useHtml5Mode      | ```false``` | Whether or not to use Angular's HTML5 mode. If you use this mode, you must have the proper hosting setup to serve html5 mode pages. Docular's grunt task comes with a simple server that will do this for you, but should not be considered production-ready.|

##docular-ng-plugin parameters.

Required parameters are in **bold**.

| Param | default | description |
|------|------|------|
| examples | ```object``` | This is a more complicated item. It should be an object with a few parameters, as listed below |
| examples.angular | ```true``` | Should the angular that Docular is running be loaded into the example app? Specify as false if you are going to provide the angular code in another file loaded by an include. |
| examples.autoBootstrap | ```true``` | Should the examples be auto-bootstrapped? This means that when the example loads, Angular will immediately try to run it. This will not likely work well if you also have requirejs dependencies. |
| examples.include | ```object``` | Explained below |
| examples.include.js | ```empty array``` | An array of javascript files that should be included in the examples. This is relative to the root of the docular application. For example, ```['./doc_files/start.js']```. This will cause the examples to load a file called ```start.js```.|
| examples.include.css | ```empty array``` | Basically the exact same thing as ```examples.include.js```, except is meant for CSS files |

##Notes on backwards compatibility with 0.6.x

* The section key is read in as a group key.
* The scripts and docs keys are read in and appended to the files key.
* The docular_partial_* keys don't apply anymore. If you want to override a file, it's as simple as using a grunt copy task to copy a file from point A to point B. 