
/*============ DEPENDENCIES ============*/

var colors = require('colors');


/*============ THE API FOR DOC_UTILS ============*/

exports.metadata = metadata;
exports.scenarios = scenarios;
exports.merge = merge;
exports.trim = trim;
exports.normalizeFile = normalizeFile;


/*============ VARIABLES / METHODS ============*/

function pageSort (a, b) {
    if(a.shortName < b.shortName) {
        return -1;
    } else if (a.shortName > b.shortName) {
        return 1;
    } else {
        return 0;
    }
}

function normalizeFile (fileName) {
  return fileName.replace(/\\/g,'/');
}

function scenarios(docs){
  var specs = [];

  specs.push('describe("angular+jqlite", function() {');
  appendSpecs('index-nocache.html#!/');
  specs.push('});');

  specs.push('');
  specs.push('');

  specs.push('describe("angular+jquery", function() {');
  appendSpecs('index-jq-nocache.html#!/');
  specs.push('});');

  return specs.join('\n');

  function appendSpecs(urlPrefix) {
    docs.forEach(function(doc){
      specs.push('  describe("' + doc.section + '/' + doc.id + '", function() {');
      specs.push('    beforeEach(function() {');
      specs.push('      browser().navigateTo("' + urlPrefix + doc.section + '/' + doc.id + '");');
      specs.push('    });');
      specs.push('  ');
      doc.scenarios.forEach(function(scenario){
        specs.push(indentCode(trim(scenario), 4));
        specs.push('');
      });
      specs.push('});');
      specs.push('');
    });
  }
}

function metadata(docs){

    var pages = [];

    docs.forEach(function(doc){

        var path = (doc.name || '').split(/(\.|\:\s*)/);
        for ( var i = 1; i < path.length; i++) {
            path.splice(i, 1);
        }
        var shortName = path.pop().trim();

        if (path.pop() == 'input') {
            shortName = 'input [' + shortName + ']';
        }

        try{

            var moduleInfo = doc.getModuleInfo();

            pages.push({
                section: doc.section,
                group: doc.group,
                id: doc.id,
                name: doc.doc_api_extensions.heading(),
                shortName: shortName,
                docType: doc.docType,
                module: moduleInfo.module,
                moduleSection: moduleInfo.section,
                moduleItem: moduleInfo.item,
                moduleSubItem: moduleInfo.subItem,
                keywords: doc.keywords()
            });

        } catch (e) {
            console.log("WARNING: ".yellow + ' Error parsing module information ', e);
        }

    });

    return pages.sort(pageSort);
}

function indentCode(text, spaceCount) {
  var lines = text.split('\n'),
    indent = '',
    fixedLines = [];

  while(spaceCount--) indent += ' ';

  lines.forEach(function(line) {
    fixedLines.push(indent + line);
  });

  return fixedLines.join('\n');
}


/**
 * This seems to make sure all links are correct by creating a mapping of docs by id
 * It also checks to make sure parent references are correct
 * Then it removes the docs from the root list and nests them to the appropriate list
 * This is done by grabbing a reference and adding it to potential parents via property / event / method
 * @param  {[type]} docs [description]
 * @return {[type]}      [description]
 */
function merge(docs){
  var byFullId = {};

  docs.forEach(function(doc) {
    byFullId['documentation/' + doc.group + '/' + doc.section + '/' + doc.id] = doc;
  });

  for(var i = 0; i < docs.length;) {
    var doc = docs[i];

    // check links - do they exist ?
    doc.links.forEach(function(link) {
      // convert #id to path#id
      if (link[0] == '#') {
        link = doc.id.split('#').shift() + link;
      }
      link = link.split('#').shift();
      if (!byFullId[link]) {
        console.log('BAD LINK: '.yellow + link);
      }
    });

    // merge into parents by removing it from the root list
    // the find parent method will add it to a nested list for each parent found
    if (findParent(doc, 'method') || findParent(doc, 'property') || findParent(doc, 'event')) {
      docs.splice(i, 1);
    } else {
      i++;
    }
  }

  function findParent(doc, name) {
    var parentName = doc[name + 'Of'];
    if (!parentName) return false;

    var parent = byFullId['documentation/' + doc.group + '/' + doc.section + '/' + parentName];
    if (!parent)
      throw new Error("No parent named '" + doc.group + '/' + doc.section + '/' +parentName + "' for '" +
        doc.name + "' in @" + name + "Of." + doc.name);

    var listName = (name + 's').replace(/ys$/, 'ies');
    var list = parent[listName] = (parent[listName] || []);
    list.push(doc);
    list.sort(orderByName);
    return true;
  }

  function orderByName(a, b){
    return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
  }
}

function trim (text) {
    var MAX_INDENT = 9999;
    var empty = RegExp.prototype.test.bind(/^\s*$/);
    var lines = text.split('\n');
    var minIndent = MAX_INDENT;
    var indentRegExp;
    var ignoreLine = (lines[0][0] != ' '  && lines.length > 1);
    // ignore first line if it has no indentation and there is more than one line

    lines.forEach(function(line){
        if (ignoreLine) {
            ignoreLine = false;
            return;
        }

        var indent = line.match(/^\s*/)[0].length;
        if (indent > 0 || minIndent == MAX_INDENT) {
            minIndent = Math.min(minIndent, indent);
        }
    });

    indentRegExp = new RegExp('^\\s{0,' + minIndent + '}');

    for ( var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(indentRegExp, '');
    }

    // remove leading lines
    while (empty(lines[0])) {
        lines.shift();
    }

    // remove trailing
    while (empty(lines[lines.length - 1])) {
        lines.pop();
    }
    return lines.join('\n');
}