#Docular plugins

There are currently two officially available plugins for Docular. 

* [docular-ng-plugin](https://github.com/Vertafore/docular-ng-plugin)
  This plugin gives Docular the ability to read and generate documentation for Angular type docs.
* [docular-markdown-plugin](https://github.com/Vertafore/docular-markdown-plugin)
  This plugin gives Docular the ability to create pages based off of simple markdown files.
  
##Creating a plugin

The plugin API has changed significantly since 0.6.x due to a strong desire to limit how much Docular has to call each plugin. Instead, it was desired that each plugin should listen for events emitted from Docular and respond appropriately. 

To create a plugin, you need to setup your project in such a way that Docular understands it. 

###Your package.json

At minimum, you should specify what your main file is for your project. To do this, set the ```main``` key to your main file. For example: 

```js

{
    "name": "MyProject",
    "main": "index.js"
}

```

Docular uses the ['q' library](https://github.com/kriskowal/q), so you should also use that or a library that is compatible with it. This is because certain events allow you to add promises to a shared array so that Docular will wait until your plugin is ready for the application to proceed. This can be seen in docular-ng-plugin, where the ProcessConfig event is called and it fetches Angular code for documenting if needed. 

###Your main file

Your main file needs to export a "new-able" function that has at least one method called "register". The "register" method will be provided the running instance of Docular, so that it may attach itself to events. Calling methods on the Docular instance is highly discouraged, as API changes may completely break your plugin.

As an example, this is the register method from the docular-ng-plugin:

```js

    ....
    register: function (generator) {
        this._generator = generator;
        generator.on('FileParse', this.parseFile.bind(this));
        generator.on('CreateDocs', this.createDocs.bind(this));
        generator.on('FileParseBackfill', this.backfillData.bind(this));
        generator.on('ProcessConfig', this.processConfig.bind(this));
        generator.on('SetupRunConfig', this.setupConfig.bind(this));
        generator.on('GetStyles', this.getStyles.bind(this));
        generator.on('CopyFiles', this.copyFiles.bind(this));
    }
    ....

```

###Events

There are currently eight events that can be listened to. 

1. ProcessConfig. This event is emitted with two parameters - the configuration options provided to Docular and an array which you can push promises into. You should use this to read any parameters in that your plugin may need. In the example of the docular-ng-plugin, we need to know whether or not the user wants to have the Angular docs included, and if they do we need to download them prior to starting to parse the docs.
2. FileRead. This event is emitted with two parameters. The first is an object with the fileName, content, docs (documents parsed from file content), and extension. The second is an array which you can push promises into. This is called when a file is to be read. If you need to push special information onto this file or replace its contents with slight modifications, this is the event to use.
3. FileParse. This event is emitted with three parameters. The first is just the name of the file. The second is an object with the fileName, content, docs, and extension. The third is an array which you can push promises into. This is probably your primary event. Use this event to parse the file provided into an object for later use.
4. FileParseBackfill. This event is emitted with three parameters. The first is just the name of the file. The second is an object with the fileName, content, docs, and extension. The third is an array which you can push promises into. You should use this if you need to read back through the documentation you've generated to clean up anything. In the case of the docular-ng-plugin, we try to make sure that all of the document objects have a module set on them. 
5. CreateDocs. This event is emitted with two parameters. The first is the document object that was created previously. The next is an array that can have promises pushed onto it. This event is where document objects get turned into document models. Each plugin may have a slightly different document model, but they all require the same basic interface, explained later.
6. SetupRunConfig. This event provides two parameters. The first is the configuration that will be loaded on Docular's load and stored in the config constant. The second is an array which promises can be pushed into. This should be used if your plugin will have some special configuration details that it needs to know about - you can add these details in and they will exist in the injectable 'config'.
7. GetStyles. This event is emitted with one parameter - an array which you can push [less](http://lesscss.org/) styles into which will be appended to the bottom of the Docular stylesheet. You should use this if you want to extend Docular or Bootstrap styles in your plugin. This may change in the future, as the current implementation feels a bit hacky.
8. CopyFiles. This event is emitted with one parameter - the folder where all of the generated files will be stored. You should use this event if you need to copy some of your own files. Use the 'sync' rather than 'async' functions here. Too many open files will cause the grunt process to crash, so it was decided that this would not be a promise setup.

###The document model

A document model is just an object that must have the following methods and properties exposed:

| toJSON() | Must return an plain object representation of the model that is ready to be serialized. |
| addSubdoc | Must accept another document model parameter to be stored as a child document |
| id | Must return a unique ID that represents the model |
| name | Must return a string name of the model |
| module | Must return a string name of the module this document belongs to. Just think of a module as an organizational unit |
| setPath() | Must accept a string path and set it on the model. A path is the path of group ID's you would need to follow to get to the document |
| hasParent() | Must return a boolean value as to whether or not a parent item has been set on this model |
| groupId | A property that must be settable. Specifies the group that this model belongs to. |

Additionally, the following must be present on the serialized object:

| handler | The plugin that is responsible for displaying the document. This relates to the angular controller that is to be created later on for displaying the document |
| search | A string that the interface can search on. |
| sortOn | A number or string that can be used to determine the position of the document in relation to its peers. |
| path | Given to you via setPath |
|groupId | The property that was set by Docular to tell which group this model belongs to |