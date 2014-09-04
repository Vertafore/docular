#Writing documentation

Docular's first and foremost goal is to stay in step with Angular's documentation practices. To that end, you should read their [documentation guide](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation). 

Here are some examples of documentation, right from the Angular source:

```js

    /**
     * @ngdoc function
     * @name angular.lowercase
     * @module ng
     * @kind function
     *
     * @description Converts the specified string to lowercase.
     * @param {string} string String to be converted to lowercase.
     * @returns {string} Lowercased string.
     */
    
    
    /**
     * @ngdoc function
     * @name angular.forEach
     * @module ng
     * @kind function
     *
     * @description
     * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
     * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
     * is the value of an object property or an array element and `key` is the object property key or
     * array element index. Specifying a `context` for the function is optional.
     *
     * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
     * using the `hasOwnProperty` method.
     *
       &#96;&#96;&#96;js
         var values = {name: 'misko', gender: 'male'};
         var log = [];
         angular.forEach(values, function(value, key) {
           this.push(key + ': ' + value);
         }, log);
         expect(log).toEqual(['name: misko', 'gender: male']);
       &#96;&#96;&#96;
     *
     * @param {Object|Array} obj Object to iterate over.
     * @param {Function} iterator Iterator function.
     * @param {Object=} context Object to become context (`this`) for the iterator function.
     * @returns {Object|Array} Reference to `obj`.
     */
     
     
     /**
      * @ngdoc function
      * @name angular.copy
      * @module ng
      * @kind function
      *
      * @description
      * Creates a deep copy of `source`, which should be an object or an array.
      *
      * * If no destination is supplied, a copy of the object or array is created.
      * * If a destination is provided, all of its elements (for array) or properties (for objects)
      *   are deleted and then all elements/properties from the source are copied to it.
      * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
      * * If `source` is identical to 'destination' an exception will be thrown.
      *
      * @param {*} source The source that will be used to make a copy.
      *                   Can be any type, including primitives, `null`, and `undefined`.
      * @param {(Object|Array)=} destination Destination into which the source is copied. If
      *     provided, must be of the same type as `source`.
      * @returns {*} The copy or updated `destination`, if `destination` was specified.
      *
      * @example
      <example module="copyExample">
      <file name="index.html">
      <div ng-controller="ExampleController">
      <form novalidate class="simple-form">
      Name: <input type="text" ng-model="user.name" /><br />
      E-mail: <input type="email" ng-model="user.email" /><br />
      Gender: <input type="radio" ng-model="user.gender" value="male" />male
      <input type="radio" ng-model="user.gender" value="female" />female<br />
      <button ng-click="reset()">RESET</button>
      <button ng-click="update(user)">SAVE</button>
      </form>
      <pre>form = {{user | json}}</pre>
      <pre>master = {{master | json}}</pre>
      </div>
     
      <script>
       angular.module('copyExample', [])
         .controller('ExampleController', ['$scope', function($scope) {
           $scope.master= {};
     
           $scope.update = function(user) {
             // Example with 1 argument
             $scope.master= angular.copy(user);
           };
     
           $scope.reset = function() {
             // Example with 2 arguments
             angular.copy($scope.master, $scope.user);
           };
     
           $scope.reset();
         }]);
      </script>
      </file>
      </example>
      */

```

Anything in the @description is considered to be markdown syntax, and so you can use markdown for formatting, links,
code snippets, etc. 

##Extra parameters

There are some parameters that I feel are missing from the angular documentation syntax, which are going to be added as 
time allows.

1. @deprecated. In large projects, this is a necessity.
2. @todo. This helps keep 'todo' items from floating under the radar. 