# docular

> Extensible Documentation Generation Based on AngularJS's Documentation Generation

## Getting Started

Note, this package is typically best used as a dependency within the grunt-docular plugin:
https://npmjs.org/package/grunt-docular

Much of the docular api is explained in that documentation.


```shell
npm install docular --save-dev
```

### Overview
AngularJS has an effective way of generating and displaying their documentation. Docular abstracts out this logic and provides an api to extend their unique approach to parsing and rendering their documentation. It is meant to be included as a dependency within a grunt-plugin so grunt users can work documentation into their build and development process.

There is work tracked in the issues to add back in most of the functionality that the original AngularJS documentation implementation had. There is additional functionality in the works tracked in the issues as well. Please provide your feedback and suggestions for features that should be included in this package out of the box.

Currently, the "docular-doc-api-doc" and "docular-doc-api-angular" packackages are included as the default docular apis for parsing and rendering. Feel free to develop your own npm packages to customize your own documentation. More is coming in the way of documentation on how to load your own other than manually installing them within docular via npm install.

## Contributing
The best way to contribute is to set up a development environment described in the readme for grunt-docular
https://github.com/gitsome/grunt-docular/blob/master/README.md

## Release History
version : 0.2.3
*Add Disqus back in and update documentation

version : 0.2.2
*Finishes minimization functionality within the search bar
*Sorting alphabetically of pages added back in

