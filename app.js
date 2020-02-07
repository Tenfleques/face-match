const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const metrics = require("./rest/metrics");
const Stream = require("./rest/Stream");
const stream = new Stream();

var bodyParser = require('body-parser');
const helpers = require('./rest/helpers');

const app = express();

const port = 8080;

app.use(express.static(__dirname + '/client/build'));
app.use(stream.enable());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let dest = "wild";
        if(req.body){
            dest = req.body.destination
        }
        cb(null, 'images/uploads/' + dest + "/");
    },
    filename: function(req, file, cb) {
        cb(null, "u" + helpers.getRandomNamePrepend() + "-" + (file.originalname.replace(/-/g,"_").replace(/\s/g, "_")));
    }
});


app.post('/images', (req, res) => {
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).any();

    upload(req, res, function(err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.files) {
            return res.send({"error" : 'Please select images to upload' });
        }
        else if (err instanceof multer.MulterError) {
            return res.send({"error" : "'" + err + "'"});
        }
        else if (err) {
            return res.send({"error" : "'" + err + "'"});
        }

        let result = "[";
        const files = req.files;
        let index, len;
        
        for (index = 0, len = files.length; index < len; ++index) {
            result += index ? "," : "";
            result += '"' + files[index].path + '"';
        }
        result += ']';
        res.send(JSON.parse(result));
    });
});

app.get('/image-matches', (req, res) => {
    // todo make watchfile determined by user session.
    const watch_file = "overall.json";
    metrics.getMetrics(req,res, path.resolve("./rest/metrics/" + watch_file));
});
app.get('/image-watch', (req, res) => {
    // todo make watchfile determined by user session.
    const watch_file = "overall.json";
    let id = watch_file  + "-" + String(req.ip) + "-updates";
    
    stream.add(id, res);
    metrics.watchFileForSSE(path.resolve("./rest/metrics/" + watch_file), stream, res, req);
    
});

app.get('/images/*', (req, res) => {
    
    const fname = "." + req.originalUrl;
    if (fname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        if (fs.existsSync(fname)){
            var resolvedPath = path.resolve(fname);
            res.sendFile(resolvedPath);
        }else{
            res.status(404).send("file not found");
        }
    }else{{
        res.status(403).send("not allowed");
    }}
});

app.get('/', (req, res) => {
    res.send("Face Match rest...");
});
app.listen(port, () => console.log(`Listening on port ${port}...`));