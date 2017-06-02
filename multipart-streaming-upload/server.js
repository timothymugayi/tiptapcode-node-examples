var express = require('express'),
    HttpStatus = require('http-status-codes'),
    morgan = require('morgan'),
    packageConfig = require('./package.json'),
    path = require('path'),
    fs = require('fs'),
    Busboy = require('busboy');

express()
    .use(morgan('combined'))
    .get('/api/v1', function (req, res) {
        res.status(HttpStatus.OK).json({msg: 'OK', service: 'File Server'})
    })
    .post('/api/v1/uploads', function (req, res) {
        var busboy = new Busboy({headers: req.headers});
        console.log(req.headers);
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            file.on('data', function (data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function () {
                console.log('File [' + fieldname + '] Finished');
            });
            var saveTo = path.join(__dirname, 'dir', path.basename(filename));
            var outStream = fs.createWriteStream(saveTo);
            file.pipe(outStream);
        });
        busboy.on('finish', function () {
            res.writeHead(HttpStatus.OK, {'Connection': 'close'});
            res.end("That's all folks!");
        });
        return req.pipe(busboy);
    }).listen(process.env.PORT || 5000, function () {
    var address = this.address();
    var service = packageConfig.name + ' version: ' + packageConfig.version + ' ';
    console.log('%s Listening on %d', service, address.port);
});
