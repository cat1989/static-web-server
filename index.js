// 1. Create and HTTP server and listen for requests
// 2. When a request arrives, parse the request URL to determine the location for the file
// 3. Check to make sure the file exists
// 4. If the file doesn't exist, respond accordingly
// 5. If the file does exist, open the file for reading
// 6. Prepare a response header
// 7. Write the file to the response
// 8. Wait for the next request
var http = require('http')
var fs = require('fs')
var mime = require('mime')
var path = require('path')
var url = require('url')

var createServer = function(base, port) {
    http.createServer(function(req, res) {
        var data = url.parse(req.url, true)
        var pathname = data.pathname
        if (pathname == '/') {
            pathname = '/index.html'
        }
        pathname = path.normalize(base + pathname)
        fs.stat(pathname, function(err, stat) {
            if (err) {
                res.writeHead(404)
                res.end()
            }
            else if (stat.isFile()) {
                var type = mime.getType(pathname)
                res.setHeader('Content-Type', type)
                res.setHeader('Content-Length', stat.size)
                // if (type != 'text/html') {
                //     res.setHeader('Last-Modified', new Date(stat.mtime).toGMTString())
                // }
                var file = fs.createReadStream(pathname)
                file.on("open", function() {
                    res.statusCode = 200
                    file.pipe(res)
                })
                file.on("error", function() {
                    res.writeHead(403)
                    res.end()
                })
            }
            else {
                res.writeHead(403)
                res.end()
            }
        })
    }).listen(port)
}

module.exports = createServer