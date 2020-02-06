const fs = require("fs");
const filewatchers = {};

const processMetricString = (data) => {
    if (data === undefined){
        res.send(JSON.parse("[]"));
        return [];
    }
    let str = data.toString().trim();
    if (str.length < 10){
        res.send(JSON.parse("[]"));
        return [];
    }

    let l =  str.length;
    if (str[l - 1 ] === ","){
        str = str.slice(0, l-1);
    }
    l =  str.length;

    if (str[0] === "[" && str[l - 1] === "]"){ // fine json
        console.log("json formatted");
    }else{
        str = "[" + str + "]";
    }
    

    const json = JSON.parse(str).map((el) => {            
        let target = el.known.slice(0,el.known.lastIndexOf(".")).split("-");
        let wild = el.unknown.slice(0,el.unknown.lastIndexOf(".")).split("-");
        let key = target[1] + wild[1];

        return {
            "distance" : el.distance,
            "key" : key,
            "target" : {
                "key" : key,
                "name" : target[1],
                "image" : "/images/uploads/target/" + target[0] + "-" + target[1],
                "id" : target[2],
                "box" : target.slice(3).map((a) => Number.parseInt(a.trim()))
            },
            "wild" : {
                "key" : key,
                "name" : wild[1],
                "image" : "/images/uploads/wild/" + wild[0] + "-" + wild[1],
                "id" : wild[2],
                "box" : wild.slice(3).map((a) => Number.parseInt(a.trim()))
            }
        }
    }).reverse();

    return json;
}
const updateStreamOfMetricFile = (ip_key, filename, stream, id, type) => {
    fs.readFile(filename, (e, data) => {
        const new_json = processMetricString(data);
        stream.update(ip_key, id, type, new_json);
    });
}
const watchFileForSSE = (filename, stream, ip_key) => {
    let id = 0;
    updateStreamOfMetricFile(ip_key, filename, stream, id, "update");

    if(filewatchers[ip_key]){
        filewatchers[ip_key].close();
    }
    const flw = fs.watch(filename, (curr, prev) => {
        id += 1;
        updateStreamOfMetricFile(ip_key, filename, stream, id, "update");
    });
    filewatchers[ip_key] = flw;
}

const getMetrics = (req, res, metric_log) => {
    fs.readFile(metric_log, (e, data) => {
        const json = processMetricString(data);
        if (req.query.target){
            res.send(json.filter((a) => a.target.name === req.query.target));
        }else{
            res.send(json);
        }            
    })
};


exports.getMetrics = getMetrics;
exports.watchFileForSSE = watchFileForSSE;