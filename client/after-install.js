var fs = require('fs')

function replaceInFile(someFile, needle, replacement){
    fs.readFile(someFile, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace(needle, replacement);
      
        fs.writeFile(someFile, result, 'utf8', function (err) {
           if (err) return console.log(err);
        });
    });
}

function recPrint(c, dir) {
    for(var i = 0; i < c.length; ++i){ 
        const possible_dir = dir + "/" + c[i];
        if(fs.existsSync(possible_dir)){ 
            if(fs.lstatSync(possible_dir).isDirectory()){ //directory file
                recDir(possible_dir);
            }else{
                // console.log(possible_dir);
                replaceInFile(possible_dir, /\/face-match\//g, '/');
            }
        }
    }    
}
function recDir(dir){
    const flist = fs.readdirSync(dir, {
        encoding: 'utf-8',
    });
    recPrint(flist, dir);
}
recDir("./build")

