var bower = require('bower');
var Q = require('q');
var fse = require('fs-extra');
var path = require('path');

var bowerDumpPath = path.resolve(__dirname, '../../../');

module.exports = {
    loadDependencies: function (dependencies) {
        var deferred = Q.defer();
        
        bower.commands.install(dependencies.map(function (item) {
            if(item.version) {
                return item.package + "#" + item.version;
            }
            return item.package;
        }), {}, {cwd: bowerDumpPath, dir: 'bower_components'})
        .on('error', function (err) {
            deferred.reject(err);
        })
        .on('end', function (res) {
            deferred.resolve(res);
        });
        
        return deferred.promise;
    },
    copyDependencies: function (dependencies, webPath) {
        var bowerPath = bowerDumpPath + '/bower_components/';
        for(var i = 0, l = dependencies.length; i < l; i++) {
            var dep = dependencies[i];
            var libPath = bowerPath + dep.package;
            var saveDir = webPath + '/resources/libraries/' + dep.savedir;
            fse.ensureDirSync(saveDir);
            for(var i2 = 0, l2 = dep.files.length; i2 < l2; i2++) {
                var file = dep.files[i2];
                if(file.push) {
                    fse.copySync(libPath + '/' + file[0], saveDir + '/' + file[1]);
                } else {
                    fse.copySync(libPath + '/' + file, saveDir + '/' + file);
                }
            }
        }
    }
};
