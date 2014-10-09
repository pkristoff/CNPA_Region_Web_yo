(function () {
    var express = require('express');
//var bodyParser = require('body-parser')
    var app = module.exports = express();
    var fs = require('fs');
    var exif = require('exiftool');
    var bodyParser = require('body-parser');
    var formidable = require('formidable');
    var spawn = require('child_process').spawn;

    var Testdata = 'Testdata';
    var Originals = 'Originals';


    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.set('views', __dirname + '/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view options', {
        layout: false
    });

    app.use(express.static(__dirname + '/app'));


    app.get('/', function (req, res) {
        res.render('index.html');
    });

    app.get('/partials/:name', function (req, res) {
        var name = req.params.name;
        res.render('partials/' + name);
    });

    var getExifMetadata = function (path, callback) {
//console.log('filepath: ' + path);

        fs.readFile(path, function (err, data) {
            if (err)
                throw err;
            else {
                exif.metadata(data, callback)
            }
        });

    };

    var xxx = function (filenames, nonFilenames, totalFiles, res) {
        return function () {
            if (filenames.length + nonFilenames.length >= totalFiles) {
//                console.log("finally done");
                res.status(200).send(filenames);
            } else {
//                console.log("looping: " + filenames.length + ":" + nonFilenames.length + ":" + totalFiles);
                setTimeout(xxx(filenames, nonFilenames, totalFiles, res), 500);
            }
        }
    };

    function getTestdataPath(rootFolder, contestName){
        return rootFolder + "/" + contestName + "/" + Testdata + "/";
    }

    function getOriginalsPath(rootFolder, contestName){
        return rootFolder + "/" + contestName + "/" + Originals + "/";
    }

    app.get('/contest', function (req, res) {
        var rootFolder = req.query.rootFolder;
        var contestName = req.query.name;
        var dirPath = getTestdataPath(rootFolder, contestName);
//        console.log("dirPath: " + dirPath);
        try {
            if (fs.existsSync(dirPath)) {
                var contestContent = fs.readdirSync(dirPath);
                getAndReturnFileInfo(contestContent, dirPath, res);

            } else {
                res.status(500).send("could not find path: " + dirPath);
            }

        } catch (exc) {
            res.status(500).send("could not find path: " + dirPath + ": " + exc.message);
        }
    });

    function getAndReturnFileInfo(contestContent, dirPath, res){

        var filenames = [];
        var nonFilenames = [];
//        console.log("files: " + contestContent);
        contestContent.forEach(function (filename) {
            var filenameSplit = filename.split(".");
            if (filenameSplit.length === 2 && (filenameSplit[1] === "jpg" || filenameSplit[1] === "JPG" || filenameSplit[1] === "jpeg" || filenameSplit[1] === "JPEG")) {
                var filePath = dirPath + filename;
                var fsStats = fs.statSync(filePath);
                if (fsStats.isFile()) {
                    try {
                        getExifMetadata(filePath, function (err, metadata) {
                            if (err) {
                                nonFilenames.push(err);
                            } else {
                                //-imagesize -iptc:CopyrightNotice -iptc:caption-abstract -xmp:title -DateTimeOriginal -FileSize
//                                        console.log(metadata);
                                filenames.push({
                                    filename: filename,
                                    imageWidth: metadata.imageWidth,
                                    imageHeight: metadata.imageHeight,
                                    copyrightNotice: metadata.copyrightNotice,
                                    dateCreated: metadata['date/timeCreated'],
                                    fileSize: fsStats.size
                                });
                            }
                        });
                    } catch (ex){
                        console.log("done ex: " + ex.message);
                        console.log("done ex: " + ex.stack);

                    }
                }
            } else {
                nonFilenames.push(filename);
            }
        });

        setTimeout(xxx(filenames, nonFilenames, contestContent.length, res), 500);
    }

    app.get('*', function (req, res) {
//    console.log("*: " + req.originalUrl);
        res.redirect('/');
    });

    app.post('/addFiles', function (req, res) {
        var form = new formidable.IncomingForm(),
            rootFolder, contestName,
            files = [],
            filenames = [];
        form.uploadDir = __dirname + '/uploads';
        form.on('field', function(field, value) {
            if (field === "rootFolder"){
                rootFolder = value;
            } else {
                contestName = value;
            }
        });
        form.on('file', function(field, file) {
//            console.log(file.name);
            files.push([field, file]);
        });
        form.on('end', function() {
//            console.log('done');
            var dirPath = rootFolder + "/" + contestName + "/";
            var dirPathOriginals = getOriginalsPath(rootFolder, contestName);
            var dirPathTestdata = getTestdataPath(rootFolder, contestName);
            files.forEach(function (entry){
                var file = entry[1];
                var fn = file.name;
                filenames.push(fn);
                fs.renameSync(file.path, dirPathOriginals + fn);
                fs.writeFileSync(dirPathTestdata + fn, fs.readFileSync(dirPathOriginals + fn));
            });
            getAndReturnFileInfo(filenames, dirPathTestdata, res);
        });
        form.parse(req);
    });

//    app.post('/deleteFiles', function (req, res) {
//        var rootFolder = req.body.rootFolder;
//        var contestName = req.body.name;
//        var filenames = req.body.filenames;
//        var dirPath = getOriginalsPath(rootFolder, contestName);
//        try {
//            if (!fs.existsSync(dirPath)) {
//                res.status(500).send(dirPath + " does not exist");
//            } else {
//                filenames.forEach(function (filename){
//                    fs.unlinkSync(dirPath+filename);
//                })
//            }
//            var rootFolderContent = fs.readdirSync(rootFolder);
//            res.status(200).send(rootFolderContent);
//
//        } catch (exc) {
//            res.status(500).send("could not delete files: " + dirPath + ": " + filenames + ": " + exc.message);
//        }
//    });

    app.post('/getContests', function (req, res) {
        var rootFolder = req.body.rootFolder;
        try {
            if (!fs.existsSync(rootFolder)) {
                fs.mkdir(rootFolder);
            }
            var rootFolderContent = fs.readdirSync(rootFolder);
            res.status(200).send(rootFolderContent);

        } catch (exc) {
            res.status(500).send("could not read contents from rootFolder: " + rootFolder + ": " + exc.message);
        }
    });

    app.post('/setCopyright', function (req, res){
        var rootFolder = req.body.rootFolder;
        var contestName = req.body.contestName;
        var filename = req.body.filename;
        var copyright = req.body.copyright;
        var dirPath = getTestdataPath(rootFolder, contestName);
        var error;



        ls    = spawn('exiftool', ['-iptc:CopyrightNotice=\"' +  copyright + '\"', dirPath+filename]);

        ls.stdout.on('data', function (data) {
//            console.log('stdout: ' + data);
        });

        ls.stderr.on('data', function (data) {
            error = ("could not set copyright:  "  + data);
        });

        ls.on('close', function (code) {
//            console.log('child process exited with code ' + code);
            if (error){
                res.status(500).send(error);
            } else {
                res.status(200).send(copyright);
            }
        });

    });


    app.post('/createContest', function (req, res) {
        var rootFolder = req.body.rootFolder;
        var contestName = req.body.name;
        var dirPath = rootFolder + "/" + contestName + "/";
        var contestContent;
        try {
            if (fs.existsSync(dirPath)) {
                dirPath = dirPath + "Originals/";
                if (fs.existsSync(dirPath)){
                    contestContent = fs.readdirSync(dirPath);
                } else{
                    fs.mkdirSync(dirPath);
                    contestContent = [];
                }
            } else {
                fs.mkdirSync(dirPath);
                fs.mkdirSync(dirPath +  + "/' + Originals + '/");
                fs.mkdirSync(dirPath +  + "/' + Testdata + '/");
                contestContent = [];
            }
            res.status(200).send(contestContent);

        } catch (exc) {
            res.status(500).send("could not find path: " + dirPath + ": " + exc.message);
        }
    });

    var server = app.listen(3000, function () {
        console.log("Express server listening on port %d", server.address().port);
    });
}());
