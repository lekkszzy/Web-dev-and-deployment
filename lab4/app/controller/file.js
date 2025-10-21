var http = require('http');
var url = require('url');
var fs = require('fs');
http.createServer(function (req, res) {
var q = url.parse(req.url, true);
if (q.pathname == '/')
var file = (__dirname + "/../view" + "/index.html");
// __dirname is where the current script is, e.g. the 'controller' folder
else file = (__dirname + "/../view" + q.pathname);
// files to be sent to the client are on the 'view' folder
fs.readFile(file, function(err, data){
if (err) {
res.writeHead(404, {'Content-Type': 'text/html'});
return res.end("404 Not Found");
}
res.writeHead(200, {'Content-Type': 'text/html'});
res.write(data);
return res.end();
});
}).listen(3000);
// starts a simple http server locally on port 3000