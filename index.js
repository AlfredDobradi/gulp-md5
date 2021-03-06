var path = require('path')
, gutil = require('gulp-util')
, through = require('through2')
, crypto = require('crypto');

function md5(hashlength,force) {
    var stream = through.obj(function(file, enc, cb) {
        if ( file.isStream() ) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if ( force !== true ) {
            force = false;
        }

        var hash = calcMd5(file,force);

        if ( null != hashlength ) {
            hash = hash.slice(0,hashlength);
        }

        var filename = path.basename(file.path);
        var dir;

        if(file.path[0] == '.'){
            dir = path.join(file.base, file.path);
        } else {
            dir = file.path;
        }
        dir = path.dirname(dir);

        var N = filename.split('.').length;
        filename = filename.split('.').map(function(item, i){
            return i == N - 2 ? item + '_'+ hash : item;
        }).join('.');

        file.path = path.join(dir, filename);

        this.push(file);
        cb();
    }, function(cb) {
        cb();
    });

    return stream;
}

function calcMd5(file,force){
    var content = file.contents;
    if ( force === true ) {
        var ts = Date.parse(new Date());
        content += ts;
    }
    var md5 = crypto.createHash('md5');
    md5.update(content, 'utf8');
    return md5.digest('hex');
}

module.exports = md5;
