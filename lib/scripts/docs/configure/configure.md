@doc overview
@id index
@name Configure Docular
@description

# Docular Configurations

The links below illustrate the use of Docular configurations via the grunt-docular.com website. The links will take you through each of configurations listed at the bottom of this page in the example Gruntfile.js file.

<page-list></page-list>

## Example Gruntfile.js for grunt-docular.com

The example below shows a bare bones Grunt configuration and the most basic configurations for Docular. The only additional content provided is the "docular_partial_home" file used to customize the homepage. The rest of the pages are documentation generated from the Docular and AngularJS source and documentation files.

```js
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            groups: [],
            showDocularDocs: true,
            showAngularDocs: true,
            docular_partial_home: 'home.html',
            analytics: {
                account: 'UA-40646426-1',
                domainName: 'grunt-docular.com'
            },
            discussions: {
                shortName: 'johndavidfive',
                url: 'http://johndavidfive.com',
                dev: false
            }
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```

## Generate the documentation and resources for the webapp

The above Gruntfile.js configuration uses...
<pre>
grunt.registerTask('default', ['docular']);
</pre>

...so to generate documenation you could take advantage of the default setting and just run
<pre>
grunt
</pre>

You could also target the documentation generation task directly:
<pre>
grunt docular
</pre>

## To view the documentation
To view the documentation without uploading it to another server, specify a `docular_webapp_target` and
add the `devserver` grunt task to your grunt configuration.
```js


    grunt.initConfig({
        ....
        docular: {
            ....
            docular_webapp_target: './docs'
            ....
        },
        devserver: {
            docs: {
                options: {
                    base: './docs',
                }
            }
        }
        ....
    });


grunt.loadNpmTasks('grunt-devserver');

```
Then run..
<pre>
grunt devserver:docs
</pre>


@doc overview
@id show
@name Show Angular and Docular Docs
@description

<ul class="properties">
    <li>
        <h3 id="annotate">showDocularDocs {boolean} false</h3>
        <div class="annotate">
            <p>When true, will include a group configuration for Docular when parsing documentation and rendering. The Docular group configuration has sections for general docs for it's use as well as documention for the Docular sources code.</p>

        </div>
    </li>
    <li>
        <h3 id="annotate">showAngularDocs {boolean} false</h3>
        <div class="annotate">
            <p>When true, will include a group configuration for Angular when parsing documentation and rendering. The Angular group configuration has sections for overview, tutorial, dev guide, and the Angular API.</p>

        </div>
    </li>
</ul>

Here is the grunt configuration for the Docular task from the grunt-docular plugin:

```js
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            groups: [],
            showDocularDocs: true,
            showAngularDocs: true,
            docular_partial_home: 'home.html',
            analytics: {
                account: 'UA-40646426-1',
                domainName: 'grunt-docular.com'
            },
            discussions: {
                shortName: 'johndavidfive',
                url: 'http://johndavidfive.com',
                dev: false
            }
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```

This website (grunt-docular.com) has both the ``showAngularDocs`` and ``showDocularDocs`` flags set to true. This allows you to view all the documentation for these two groups. This site has these set to true so you can see the difference between two documentation groups.

<docular-pager></docular-pager>


@doc overview
@id groups
@name Documentation Groups
@description

<ul class="properties">
    <li>
        <h3 id="annotate">groups {array of group objects} [-empty-]</h3>
        <div class="annotate">
            <p>The groups array holds group objects which hold configurations for a documentation group</p>

            <h3> Properties </h3>
            <ul class="parameters">
                <li>
                    ``groupTitle`` – `{string}` –
                    <p>The name of group. Appears in the UI for tabs etc...</p></li>
                <li>
                    ``groupId`` – `{string}` –
                    <p>The unique id of the group. Visible in the url for this documentation group</p>
                </li>
                <li>
                    ``groupIcon`` – `{string}` – </code>
                    <p>The class used in rendering icons for this group. See the icon options you have at <a href="http://fortawesome.github.io/Font-Awesome/" target="_bank">Font Awesome</a>. The default is "icon-book".</p>
                </li>
                <li>
                    ``showSource`` – `{boolean}` –
                    <p>Defaults to false. When true will copy all source files to the webapp so they can be displayed in the UI. <span style="color:#FF0033">WARNING</span> All files within this group should be considered public. All information should be considered insecure. Note, you can set the 'showSource' configuration at the section level to override the group level setting.</p>
                </li>
                <li>
                    ``sections`` – `{array}` –
                    <p>Holds <a href="">section objects</a> which contain configurations that point Docular to docs that need to be parsed. Sections are seen as dropdown items within a group tab. Sections are meant to provide a logical way to partition your documentation and apis. In the case of both Docular and AngularJS, sections provides ways to separate actual API information from "overview" and "tutorial" like documentation. It defaults to an empty array which results in no creation of groups.</p>
                </li>
            </li>
            </ul>

        </div>
    </li>
</ul>

This website (grunt-docular.com) has the ``groups`` configuration set to an empty array. This is because there is no additional documentation necessary to generate for the "grunt-docular.com" site. Since the group configurations are built into Docular, we can just switch them on using the ``showDocularDocs`` flag which adds the Docular group into the mix at run time.

This is what it would look like if we were to manually add the Docular documetation group configuration:

```js
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            groups: [
                {
                    groupTitle: 'Docular',
                    groupId: 'docular',
                    groupIcon: 'icon-beer',
                    showSource: true,
                    sections: [
                        //section objects ommitted here
                    ]
                }
            ],
            //other configurations ommitted here for simplicity
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```
<docular-pager></docular-pager>


@doc overview
@id sections
@name Documentation Section
@description

<ul class="properties">
    <li>
        <h3 id="annotate">section {object}</h3>
        <div class="annotate">
            <p>Sections are objects that create logical sections for documentation generation withing a group.</p>

            <h3> Properties </h3>
            <ul class="parameters">
                <li>
                    ``id`` – `{string}` –
                    <p>The unique id that is used internally and appears within the url for each doc parsed</p>
                </li>
                <li>
                    ``title`` – `{string}` –
                    <p>The title of the section that is used often in the UI</p>
                </li>
                <li>
                    ``showSource`` – `{boolean}` –
                    <p>Defaults to false. When true will copy all source files to the webapp so they can be displayed in the UI. <span style="color:#FF0033">WARNING</span> All files within this section should be considered public. All information should be considered insecure. Note, this section level 'showSource' configuration will override the group level setting.</p>
                </li>
                <li>
                    ``scripts`` – `{array : paths}` –
                    <p>An array of paths that may reference a directory or a single file. The single file or every file in the directory will be scanned for documentation THAT IS WITHIN BLOCK COMMENTS.</p>
                    <div class="alert alert-info">Currently, scripts need to end in ".js". This will change in the future to allow any type of script.</div>
                    <pre>
/**
 * @doc docType
 * @doc id
 * @doc name
 * @doc description
*/
                    </pre>
                </li>
                <li>
                    ``docs`` – `{array : paths}` –
                    <p>An array of paths that may reference a directory or a single file. The single file or every file in the directory will be scanned for documentation THAT IS NOT WITHIN COMMENTS.</p>
                    <div class="alert alert-info">Doc files must have an extension of ".doc" or ".ngdoc".</div>
                    <pre>
&#64;doc docType
&#64;doc id
&#64;doc name
&#64;doc description
                    </pre>
                </li>
                <li>
                    ``rank`` – `{object}` –
                    <p>The rank object contains key value pairs, where the key is an id of a document and the value is the ranking associated with that document. This object is used to place sections in order within the UI. If a document does not have a rank, it is automatically set to a large number (which pushes it to the bottom).</p>
                </li>
            </li>
            </ul>

        </div>
    </li>
</ul>

## Sample section object

Below we have included ONE of the sections normally added for the default Docular documenation

```js
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            groups: [
                {
                    groupTitle: 'Docular',
                    groupId: 'docular',
                    groupIcon: 'icon-beer',
                    sections: [
                        {
                            id: "docularinstall",
                            title: "Install Docular",
                            showSource: false,
                            docs: [
                                "lib/scripts/docs/install"
                            ],
                            rank: {
                                'installnode':1,
                                'installgrunt':2,
                                'installdocular':3
                            }
                        },
                        //the rest of the section objects ommitted
                    ]
                }
            ],
            //other configurations ommitted here for simplicity
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```
<a id="docsnscripts" class="anchor"></a>
## The difference between Docs and Scripts

We provide two buckets, "docs", and "scripts" as configurations within a section object. You can certainly use both within one section but understanding the difference is important.

Every directory or filename specified within the "docs" array will be parsed for documentation that exists NOT within comments in that file. So "docs" files are meant to basically be non-code files with "overview" or "tutorial" type information. Doc files are there for providing a more convient way of creating documentation that doesn't necessarily depend on actual code.

As of this writing, all "doc" files should have a ".doc" or ".ngdoc" extension.

If you specify a file or directory within the "scripts" array, those files will all be scanned for documentation WITHIN block comments. This is a great way to add documentation inline and near your actual code.

There is a lot of flexibility so just follow what works for your project.

## Group Configuration for Docular

```js
{
    groupTitle: 'Docular',
    groupId: 'docular',
    groupIcon: 'icon-edit',
    descr: 'Description',
    showSource: true,
    sections: [
        {
            id: "docularinstall",
            title: "Install Docular",
            docs: [
                "lib/scripts/docs/install"
            ],
            rank: {
                'installnode':1,
                'installgrunt':2,
                'installdocular':3
            }
        },
        {
            id: "docularconfigure",
            title: "Docular Configurations",
            docs: [
                "lib/scripts/docs/configure"
            ],
            rank: {
                'show':1,
                'groups':2,
                'sections':3,
                'discussions':4,
                'analytics':5,
                'partials':6,
                'ui':7
            }
        },
        {
            id: "docularcreate",
            title: "Documentation Groups and Sections",
            docs: [
                "lib/scripts/docs/create"
            ],
            rank: {'configuregroup':1, 'configuresection':2, 'firstdoc':3}
        },
        {
            id: "embed",
            title: "Embedding Documentation",
            docs: [
                "lib/scripts/docs/embed"
            ],
            rank: {'blockdef_js':1, 'blockdef_doc':2}
        },
        {
            id: 'basics',
            title: 'Documentation Basics',
            docs: [
                "lib/scripts/docs/basics"
            ],
            rank : {
                'identifier':1,
                'naming':2,
                'fields':3,
                'modules':4,
                'sections':5,
                'types':6,
                'types_doc':7,
                'types_ngdoc':8,
                'children':9,
                'links':10
            }
        },
        {
            id: "doctypes",
            title: 'Documentation Types (DocTypes)',
            docs: [
                "lib/scripts/docs/doctypes/doctypes.doc"
            ],
            rank : {'types_doc':2, 'types_ngdoc':3}
        },
        {
            id: "docularext",
            title:"Docular Extensions",
            scripts: [],
            docs: [
                "lib/scripts/docs/extensions"
            ]
        },
        {
            id: "docular",
            title:"Docular Source",
            scripts: [
                "lib/scripts/gen-docs.js",
                "lib/scripts/reader.js",
                "lib/scripts/writer.js",
                "lib/scripts/Doc.js"
            ],
            docs : [
                "lib/scripts/docs/node",
                "README.md"
            ]
        },
        {
            id: "docularfaq",
            title:"FAQs",
            scripts: [],
            docs: [
                "lib/scripts/docs/faq"
            ]
        }
    ]
}
```

## Group Configuration for AngularJS Source

We made some small tweaks, but ported over most of the AngularJS "scripts" and "docs" in tact.

```js
{
    groupTitle: 'Angular',
    groupId: 'angular',
    groupIcon: 'icon-book',
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

<docular-pager></docular-pager>


@doc overview
@id discussions
@name Discussions
@description

<ul class="properties">
    <li>
        <h3 id="annotate">discussions {object}</h3>
        <div class="annotate">
            <p>Holds configurations for the current dicussion management plugin (<a href="http://disqus.com/" target="_blank">Disqus</a>)</p>

            <h3> Properties </h3>
            <ul class="parameters">
                <li>
                    ``shortName`` – `{string}` –
                    <p>The shortName property required by Disqus</p></li>
                <li>
                    ``url`` – `{string}` –
                    <p>The url property required by Disqus</p>
                </li>
                <li>
                    ``dev`` – `{boolean} (false)` –
                    <p>When true provides a true flag to the Disqus dev API</p>
                </li>
            </li>
            </ul>

        </div>
    </li>
</ul>

## Discussions Defaults

If you do not provide discussion configurations, then the discussions markup will not be shown and the discussions logic will not be executed.

```js
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            // other options ommitted for simplicity
            discussions: {
                shortName: 'johndavidfive',
                url: 'http://johndavidfive.com',
                dev: false
            }
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```

<docular-pager></docular-pager>


@doc overview
@id analytics
@name Google Analytics
@description

<ul class="properties">
    <li>
        <h3 id="annotate">analytics {object}</h3>
        <div class="annotate">
            <p>Holds configurations for the current analytics management plugin (<a href="http://www.google.com/analytics/" target="_blank">Google Analytics</a>)</p>

            <h3> Properties </h3>
            <ul class="parameters">
                <li>
                    ``accountName`` – `{string}` –
                    <p>The accountName property required by Google Analytics</p></li>
                <li>
                    ``domainName`` – `{string}` –
                    <p>The domainName property required by Google Analytics</p>
                </li>
            </li>
            </ul>

        </div>
    </li>
</ul>

```js
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            // other options ommitted for simplicity
            analytics: {
                account: 'UA-40646426-1',
                domainName: 'grunt-docular.com'
            }
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```

## Analytics Defaults

If you do not provide analytic configurations, then the analytic calls will not be made.

## Analytics Service Calls

Currently, there are two separate calls made during navigation within the webapp.

* Page view sent when the root url is hit as "/"
* Page view sent when any documentation file is sent. The page view is "/documentation/groupId/sectionId/pageId"

<docular-pager></docular-pager>


@doc overview
@id partials
@name Customize the Homepage and other Partials
@description

<ul class="properties">
    <li>
        <h3 id="annotate">docular_partial_home {string}</h3>
        <div class="annotate">
            <p>Provides a url relative to the root of the grunt-docular plugin which points to an html "partial" file. This is a file that contains valid html that does not contain the html, head, or body elements.</p>
        </div>
        <h3>Availible Directives</h3>
        <p>
            The homepage partial has access to the following directives:
            <ul>
                <li>
                    &lt;documentation-section-list group="{string} optional group filter" header="{boolean} show title" &gt;&lt;/documentation-section-list&gt;
                </li>
            </ul>
        </p>
        <h3>Example</h1>
        <p>The configuration for {@link http://grunt-docular.com grunt-docular.com}</p>
        ```js
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            // other options ommitted for simplicity
            docular_partial_home: 'home.html'
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```
        <p>This site {@link http://grunt-docular.com grunt-docular.com} uses the following for it's homepage:
```doc
<div class="span3">

    <documentation-group-list></documentation-group-list>

</div>

<div class="span9">

    <h1><i class="icon-rocket" style="color:#ff8900;"></i> Documentation... and Beyond!</h1>

    <p>
        Docular is a NodeJS package that is based on AngularJS's documentation generation implementation. Docular is best used through the Grunt plugin "<a href="https://npmjs.org/package/grunt-docular" target="_blank">grunt-docular</a>".
    </p>

    <div class="alert alert-warn"><i class="icon-beaker"></i> Docular is currently in Beta</div>

    <h2>Wahooo! Docular is almost out of Beta!</h2>

    <p>
        Documentation is almost complete, and a final list of features for the first release have been identified. Stay tuned!
    </p>

    <a href="https://github.com/Vertafore/grunt-docular/docular/issues?state=open" target="_blank" class="btn ">Suggest a Feature / Report a Bug</a>

    <h2><i class="icon-flag" style="color:#555;"></i> Get Started </h2>
    <documentation-section-list group="docular" header="false"></documentation-section-list>

    <h2><i class="icon-file-alt" style="color:#555;"></i> Documentation Samples</h2>
    <p>
        This entire site was generated through Docular, so anything you see here can be recreated using Docular.
    </p>

    <p>
        Browse around the site and be sure to check out the AngularJS source documention and Docular source to see how you can customize your own documentation experience.
    </p>

    <h2><i class="icon-code-fork" style="color:#555;"></i> Docular Uses:</h2>

    <div class="row-fluid shout-outs">
        <div class="span12">
            <a href="http://gruntjs.com/" target="_blank" alt="gruntJS"><img src="/resources/img/grunt.png"/></a>
            <a href="http://angularjs.org/" target="_blank" alt="angularJS"><img src="/resources/img/angular.png"/></a>
            <a href="http://nodejs.org/" target="_blank" alt="nodeJS"><img src="/resources/img/node.png"/></a>
        </div>
    </div>

</div>
```
    </li>
</ul>

<docular-pager></docular-pager>


@doc overview
@id docular-webapp-target
@name Webapp Target
@description

<ul class="properties">
    <li>
        <h3 id="annotate">docular_webapp_target {string}</h3>
        <div class="annotate">
            <p>A string relative to current location of the Gruntfile.js file that indicates where the webapp files should be generated. This is the entire webapp with all the generated partials.</p>
        </div>
    </li>
</ul>

## Defaults

If you do not provide the docular_webapp_target configuration, then the webapp will be generated in a target directory that lives within the Docular node_module.

Currently, the entire directory get's rewritten. We hope to soon allow you to edit files within the target directory without them being blown away. Stay tuned!

```js
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            // other options ommitted for simplicity
            docular_webapp_target : "my-documentation"
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
```

<docular-pager></docular-pager>



@doc overview
@id ui
@name Inject Styles and Behavior
@description

This API is coming soon!

<docular-pager></docular-pager>