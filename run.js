var fs = require('fs');
var http = require('http'); 

var modelCircleStroke = require('./model/circleStroke.js');

var circleStroke = new modelCircleStroke(
    {
        numFace:12,
        stroke:3,
        radius:7,
    }
)

var mem = JSON.stringify(circleStroke);

switch(process.argv[2]){
    case "serve":
        var t;
        http.createServer(function (req, res) {
            t = req.url.split('/');
           
            switch(t[1]){
                case 'model.json':
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(mem);
                    break;
                case '':
                case 'index.html':
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(fs.readFileSync('./serve/index.html'));
                    break;
                case 'script':
                    if (t[2] && fs.existsSync('./serve/script/' + t[2])) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.write(fs.readFileSync('./serve/script/' + t[2]));
                    }else{
                        res.end();
                    }
                    break;
            
            }
            res.end();
        }).listen(8080);
        break;
    case "deploy":
        fs.writeFile('./serve/model.json',mem , 'utf8',()=>{
            console.log("... BINGO");
        });
        break;

}



