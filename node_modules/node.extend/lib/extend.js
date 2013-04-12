/*!
 * node.extend
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * @fileoverview
 * Port of jQuery.extend that actually works on node.js
 */
var fs = require( 'fs' );

function is_plain_obj( obj ){
  if( !obj ||
      {}.toString.call( obj ) !== '[object Object]' ||
      obj.nodeType ||
      obj.setInterval ){
    return false;
  }

  var has_own                   = {}.hasOwnProperty;
  var has_own_constructor       = has_own.call( obj, 'constructor' );
  var has_is_property_of_method = has_own.call( obj.constructor.prototype, 'isPrototypeOf' );

  // Not own constructor property must be Object
  if( obj.constructor &&
      !has_own_constructor &&
      !has_is_property_of_method ){
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for( key in obj ){}

  return key === undefined || has_own.call( obj, key );
};

function extend (){
  var target = arguments[ 0 ] || {};
  var i      = 1;
  var length = arguments.length;
  var deep   = false;
  var options, name, src, copy, copy_is_array, clone;

  // Handle a deep copy situation
  if( typeof target === 'boolean' ){
    deep   = target;
    target = arguments[ 1 ] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if( typeof target !== 'object' && typeof target !== 'function' ){
    target = {};
  }

  for( ; i < length; i++ ){
    // Only deal with non-null/undefined values
    if(( options = arguments[ i ]) != null ){
      // Extend the base object
      for( name in options ){
        src  = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if( target === copy ){
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if( deep && copy && ( is_plain_obj( copy ) || ( copy_is_array = Array.isArray( copy )))){
          if( copy_is_array ){
            copy_is_array = false;
            clone = src && Array.isArray( src ) ? src : [];
          }else{
            clone = src && is_plain_obj( src ) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend( deep, clone, copy );

        // Don't bring in undefined values
        }else if( copy !== undefined ){
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

/**
 * @public
 */
extend.version = JSON.parse( fs.readFileSync( __dirname + '/../package.json', 'utf8' )).version;

/**
 * Exports module.
 */
module.exports = extend;
