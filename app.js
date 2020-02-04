const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require("fs");

var bodyParser = require('body-parser');
const helpers = require('./rest/helpers');

const app = express();

const port = 6008;

app.use(express.static(__dirname + '/client/build'));

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
    fs.readFile("./rest/metrics/overall.json", (e, data) => {
        if (data === undefined){
            res.send(JSON.parse("[]"));
            return;
        }
        let str = data.toString().trim();
        if (str.length < 10){
            res.send(JSON.parse("[]"));
            return;
        }

        let l =  str.length;
        if (str[l - 1 ] === ","){
            str = "[" + str.slice(0, l-1) + "]";
        }
        const json = JSON.parse(str).map((el) => {            
            let target = el.known.slice(0,el.known.lastIndexOf(".")).split("-");
            let wild = el.unknown.slice(0,el.unknown.lastIndexOf(".")).split("-");

            return {
                "distance" : el.distance,
                "key" : el.known + el.unknown,
                "target" : {
                    "key" : el.known + el.unknown,
                    "name" : target[1],
                    "image" : "/images/uploads/target/" + target[0] + "-" + target[1],
                    "id" : target[2],
                    "box" : target.slice(3).map((a) => Number.parseInt(a.trim()))
                },
                "wild" : {
                    "key" : el.known + el.unknown,
                    "name" : wild[1],
                    "image" : "/images/uploads/wild/" + wild[0] + "-" + wild[1],
                    "id" : wild[2],
                    "box" : wild.slice(3).map((a) => Number.parseInt(a.trim()))
                }
            }
        }).reverse();

        if (req.query.target){
            res.send(json.filter((a) => a.target.name === req.query.target));
        }else{
            res.send(json);
        }            
    })
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