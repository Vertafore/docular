@doc overview
@name index
@description
# Installing Docular

Installing Docular is as simple as adding the grunt-docular Grunt plugin to your project, customizing the Docular configurations, and then simply authoring your own documentation.

First let's get Docular installed.

<div class="alert alert-info">NOTE: These instructions were created using a 'nix environment.</div>

<h2>Installation Steps</h2>

<page-list></page-list>



@doc overview
@id installnode
@name Install Node
@description

<img src="/resources/img/node.png" class = "pull-left" style="height:40px;"/>

Docular and the Grunt plugin for Docular are tools that runs in NodeJS.

NodeJS is built off of Google's JavaScript runtime environment. The original source for the AngularJS documentation generation was written for NodeJS so Docular followed suit.

The newest versions of NodeJS come bundled with NPM ([Node Packaged Modules](https://npmjs.org/)). NPM will be your friend and is a very powerful approach to managing dependencies within your project. The Docular NPM package depends on this system to install additional extensions that are managed through NPM.

1. [Install NodeJS](http://nodejs.org/)
2. Create a new NPM project if you like (optional)
    * First create the root directory for your new project
    <pre>mkdir myProj</pre>
    * Move into that new directory
    <pre>cd myProj</pre>
    * Initialize a new NPM project
    <pre>npm init</pre>
    * Follow the prompts

<docular-pager></docular-pager>


@doc overview
@id installgrunt
@name Install Grunt
@description

<img src="/resources/img/grunt.png" class = "pull-left" /> Next you need to setup Grunt.

This is a task runner that runs in NodeJS. Docular has grunt plugin "grunt-docular" that makes it easy to
configure your own setup for generating documentation.

Installing Grunt will afford you more than just access to Docular. Grunt ships with some powerful built in tasks that almost any project can take advantage of.

Once you have Docular up and running spend some time learning the other benefits of using Grunt.

<div class="alert alert-info">NOTE: Grunt has a Freenode IRC channel! #grunt </div>

Once you install Grunt on your system, you will need to add Grunt to your project as a dependency and add a configuration file that will be used to configure all Grunt tasks including the grunt-docular plugin.

1. [Install Grunt](http://gruntjs.com/getting-started)
2. Navigate to the root of your project "myProject"
<pre>
cd myProject
</pre>
3. Add Grunt to your project
<pre>
npm install grunt
</pre>
4. Create a Gruntfile.js file (others may use [grunt-init](http://gruntjs.com/project-scaffolding))
<pre>
touch Gruntfile.js
</pre>
5. Add the following to your new Gruntfile.js (This is a bare bones config file)
<pre>
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    });

};
</pre>

Now you are ready to install and configure grunt-docular!

<docular-pager></docular-pager>


@doc overview
@id installdocular
@name Install Docular
@description

Now that you have NodeJS, NPM, and Grunt installed, it's time to install the grunt-docular package.

The grunt-docular package will bring in Docular as a dependency and exposes tasks that hook into the Docular package.

## Install the grunt-docular package

1. Navigate to the root of your project
<pre>
cd <your project root>
</pre>
2. Install the grunt-docular plugin
<pre>
npm install grunt-docular
</pre>
3. Add this line to the Gruntfile.js file to include the grunt-docular tasks
<pre>
grunt.loadNpmTasks('grunt-docular');
</pre>
4. Add the basic configuration to the initConfigs for the docular task
<pre>
docular: {
    groups: [],
    showDocularDocs: true,
    showAngularDocs: true
}
</pre>
5. Register a default task for convenience by adding this line to the Gruntfile.js file
<pre>
grunt.registerTask('default', ['docular']);
</pre>

The final Gruntfile.js with mods should look like this:
<pre>
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        docular: {
            groups: [],
            showDocularDocs: true,
            showAngularDocs: true
        }

    });

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    // Default task(s).
    grunt.registerTask('default', ['docular']);

};
</pre>

Note that we have enabled the inclusion of the AngularJS docs and Docular docs as an example to make
sure everything is working. You can turn them off later when you have created your own "groups".

## Test your grunt-docular install and configuration
1. From the root of your project run the default grunt task
<pre>
grunt
</pre>
2. You should see some successful console statments, something similar to this:
<pre>
Running "docular" task

-------- generating documentation objects --------
Extracting docular Documentation For Section "docularinstall"...
Extracting docular Documentation For Section "docularoverview"...
Extracting docular Documentation For Section "docularext"...
Extracting docular Documentation For Section "docular"...
Extracting angular Documentation For Section "api"...
Extracting angular Documentation For Section "guide"...
Extracting angular Documentation For Section "tutorial"...
Extracting angular Documentation For Section "misc"...
-------- generating partials directories for groups --------
-------- generating partials directories for sections --------
-------- merging child docs with parents --------
BAD LINK: documentation/angular/cookbook/index
-------- generating partials --------
-------- generating keyword data --------
-------- generating index.html page --------
-------- ordering and concatenating doc_api css and js --------
-------- generating report --------
DONE! Generated 229 pages in 2964 ms. Partials per second : 77
</pre>
3. Now you can spin up a NodeJS server to view your documentation by running the docular-server task
<pre>
grunt docular-server
</pre>
4. Verify the succesful console statment for the server
<pre>
Documentation server running at http://127.0.0.1:8000/
</pre>
5. Navigate your browser to the specified URL and view Docular docs

<docular-pager></docular-pager>


