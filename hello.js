var http = require('http');
http.createServer(function (req, res) {
res.writeHead(200, {'Content-Type':'text/html'});
res.end('Hello World!');
}).listen(3000, '127.0.0.1', () => {
console.log('Listening on 127.0.0.1:3000');
});