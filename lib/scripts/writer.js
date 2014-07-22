/**
 * All writing related code here. This is so that we can separate the async code from sync code
 * for testability
 */
var qfs = require('q-io/fs');
var Q = require('q');
var OUTPUT_DIR = '';
var fs = require('fs');
var path = require('path');
var qio = require('q-io/fs');


exports.output = output;
function output(file, content) {
    var fullPath = OUTPUT_DIR + file;
    var dir = parent(fullPath);
    exports.makeDir(dir);
    fs.writeFileSync(fullPath, exports.toString(content));
    return Q.all([]);
};

//recursively create directory
exports.makeDir = function(p, relative) {

    var parts = p.split(/\//);
    var path = relative ? "." : "";

    var checkExists = function (pt) {
        return fs.existsSync(pt);
    };

    var createPart = function (exists) {

        if(!exists && parts.length) {
            path += "/" + parts.shift();
            var pathExists = checkExists(path);
            if (!pathExists) {
                try {
                    fs.mkdirSync(path);
                    createPart(true);
                } catch (e) {
                    createPart();
                }
            } else {
                createPart();
            }
        }
    };

    // Recursively rebuild directory structure
    createPart(checkExists(p));
    return true;
};

exports.copyTemplate = function(filename) {
  return exports.copy('docs/src/templates/' + filename, filename);
};

/* Copy files from one place to another.
 * @param from{string} path of the source file to be copied
 * @param to{string} path of where the copied file should be stored
 * @param  transform{function=} transfromation function to be applied before return
 */
exports.copy = function(from, to, transform) {
  var args = Array.prototype.slice.call(arguments, 3);

  // We have to use binary reading, Since some characters are unicode.
  return qfs.read(from, 'b').then(function(content) {
    if (transform) {
      args.unshift(content.toString());
      content = transform.apply(null, args);
    }
    return output(to, content);
  });
};


exports.symlink = symlink;
function symlink(from, to) {
  return qfs.exists(to).then(function(exists) {
    if (!exists) {
      return qfs.symbolicLink(to, from);
    }
  });
}


exports.symlinkTemplate = symlinkTemplate;
function symlinkTemplate(filename) {
  var dest = OUTPUT_DIR + filename,
      dirDepth = dest.split('/').length,
      src = Array(dirDepth).join('../') + 'docs/src/templates/' + filename;

  return symlink(src, dest);
}


/* Replace placeholders in content accordingly
 * @param content{string} content to be modified
 * @param replacements{obj} key and value pairs in which key will be replaced with value in content
 */
exports.replace = function(content, replacements) {
  for(key in replacements) {
    content = content.replace(key, replacements[key]);
  }
  return content;
}


exports.copyDir = function(dir, dest) {

  function copyDirInternal(dir) {
    return qfs.listTree('docs/' + dir).then(function(files) {
      files.forEach(function(file) {
        exports.copy(file, file.replace(/^docs\//, ''));
      });
    });
  };

  if(dest === undefined) {
    return copyDirInternal(dir);
  } else {
    return qfs.exists(dest).then(function(exists) {
      if(exists){
        return qio.removeTree(dest).then(function() {
          return qio.copyTree(dir, dest);
        });
      }else{
        return qio.copyTree(dir, dest);
      }
    });
  }
};




exports.merge = function(srcs, to) {
  return merge(srcs.map(function(src) { return 'docs/src/templates/' + src; }), to);
};

function merge(srcs, to) {
  var contents = [];
  //Sequentially read file
  var done;
  srcs.forEach(function(src) {
    done = Q.when(done, function(content) {
      if(content) contents.push(content);
      return qfs.read(src, 'b');
    });
  });

  // write to file
  return Q.when(done, function(content) {
    contents.push(content);
    return output(to, contents.join('\n'));
  });
}


//----------------------- Synchronous Methods ----------------------------------

function parent(file) {
  var parts = file.split('/');
  parts.pop();
  return parts.join('/');
}


exports.toString = function toString(obj) {
  switch (typeof obj) {
  case 'string':
    return obj;
  case 'object':
    if (obj instanceof Array) {
      obj.forEach(function(value, key) {
        obj[key] = toString(value);
      });
      return obj.join('');
    } else if (obj.constructor.name == 'Buffer'){
      // do nothing it is Buffer Object
    } else {
      return JSON.stringify(obj);
    }
  }
  return obj;
};


function noop() {};

