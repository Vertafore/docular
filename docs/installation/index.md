#Installation

Installing docular is fairly straightforward. The most likely way you will use docular is through its 
[grunt-docular](https://github.com/Vertafore/grunt-docular)
plugin. There are few prerequisites that you must manually take care of. 

1. You need [Node.js](http://nodejs.org) installed. 
2. You need [Grunt](http://www.gruntjs.com) installed. 
3. You need to setup your package.json file.
4. You need to setup your Gruntfile.js file.

##Installing Node

For most systems, installing Node is straightforward. For Windows and Mac, there are prebuilt installers available
on the Node.js [download page](http://nodejs.org/download/). Most linux systems will install Node through their own 
package system, though some do not bundle NPM (Node Package Manager) with the Node application. For instance, in Ubuntu
you need to run ```sudo apt-get install nodejs``` and then ```sudo apt-get install npm```. 

##Installing Grunt

In order to run Grunt via the command line, as you'll have to do in order to run the grunt-docular task, you will need
to install the [grunt-cli](https://www.npmjs.org/package/grunt-cli) package. Since it's an executable, you need to 
install it with NPM globally. This is done by running ```npm install -g grunt-cli```. 

##Setting up your package.json file

Current docular versions:
* docular: [![NPM version](https://badge.fury.io/js/docular.svg)](http://badge.fury.io/js/docular)
* grunt-docular: [![NPM version](https://badge.fury.io/js/grunt-docular.svg)](http://badge.fury.io/js/grunt-docular)

If you aren't familiar with what a package.json file is, you should probably [read through the docs](https://www.npmjs.org/doc/files/package.json.html).
The shorter version is that you will want a file setup like this:

```js
    {
        "name": "YourProjectName",
        "version": "0.0.1",
        "devDependencies": {
            
        }
    }
```

The ```devDependencies``` key is the important one to note. Normally you'd add your dependencies in via the ```dependencies```
key. However, grunt-docular isn't something that your application requires to run. It is only necessary as a tool for
development, hence the ```devDependencies```. 

Inside of ```devDependencies```, add ```"grunt": "~0.4.0"``` and ```"grunt-docular": "~TheVersionAbove"```. In case you 
aren't familiar, the tilde tells NPM to install a version that is "reasonably close" to the specified version. This 
will ensure you get bugfixes, but shouldn't cause you to switch to minor or major releases.

After you have those two items added to ```devDependencies```, run ```npm install```. This will spider through all of the
dependencies and install them.

##Setting up your Gruntfile.js

Specific configuration parameters can be found in the @{link configuration/index configuration docs}.

Setting up your Gruntfile.js to look like the following:

```js

module.exports = function (grunt) {
    grunt.initConfig({
        docular: {
            //We'll fill in this in a minute
        }
    });
    
    grunt.loadNpmTasks('grunt-docular');
    
}

```

Now that you've got that, we need to give Docular instructions on how to generate its files. First, let's tell it
where to put the generated files by setting the ```docular_webapp_target``` directory to ```docs```. Then, lets have
it show the angular docs by default by adding in the key ```showAngularDocs``` with the value of ```true```. Finally,
we want to give the site a title. Set the ```groupTitle``` key to the name of your site - for example "My Docs".

Now, run ```grunt docular```. You should see some text fly by as Angular gets downloaded, parsed, and then generated 
into documentation. This is great, but you need to actually be able to see it.

There are a couple options here. 

###Using grunt-docular's builtin server.
One of Docular's contributors added a small webserver to it called 'docularserver'. To make that work, 
add the follwoing to your initConfig object:

```js
docularserver: {
    targetDir: 'docs',
    port: 8888
}
```

Then run ```grunt docularserver```. Voila - your documentation has been served.

###Using a third party server

You could serve these files up with something like Apache.. or you can try serving them with another Grunt task.

One of the grunt file servers out there is called 'devserver'. To install, you add ```"devserver": "*"``` to your
```devDependencies```, run ```npm install``` again, and add the following to your initConfig object: 

```js
devserver: {
    docs: {
        options: {
            base: './docs',
            port: 8888
        }
    }
}
```
This will allow you to run ```grunt devserver:docs```, which will serve up all the files on the machine's IP address
and specified port. For example, [http://localhost:8888](http://localhost:8888). 

##Documentation generation for your code

In the ```docular``` section of the config, add a ```groups``` array. Inside of that array, we need a minimum of:

* groupTitle - the title of this section of documentation... such as "Site Controls"
* groupId - the ID that is to be used to keep groups organized and make it easier to find code that relates to one another.
For example, 'siteControls'. 
* files - a list of files that need to be parsed. The best way of providing this is by using ```grunt.file.expand```, 
which accepts a series of file filters. 

For example:

```js

module.exports = function (grunt) {
    grunt.initConfig({
        docular: {
            groupTitle: 'My documentation site',
            groups: [
                {
                    groupTitle: 'Site Controls',
                    groupId: 'siteControls',
                    files: grunt.file.expand(['public/javascript/**/*.js'])
                }
            ]
        }
    });
    
    grunt.loadNpmTasks('grunt-docular');
    
}

```

Run ```grunt docular``` again, and you should see your documentation pop up on the site.