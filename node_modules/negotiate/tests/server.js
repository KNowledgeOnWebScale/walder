var variants = [
	{
		"method" : "GET",
		"type" : "text/html",
		"language" : "en-ca",
		"charset" : "ISO-8859-1",
		"quality" : 1.0,
		"length" : 35,
		"filename" : "var1.html"
	},
	{
		"method" : "GET",
		"type" : "application/xhtml+xml",
		"language" : "en-ca",
		"charset" : "ISO-8859-1",
		"quality" : 1.0,
		"length" : 35,
		"filename" : "var1.html"
	},
	{
		"method" : "GET",
		"type" : "application/json",
		"quality" : 0.3,
		"length" : 18,
		"filename" : "var2.json"
	}
];
var sys = require("sys");
var fs = require("fs");
var negotiate = require("../negotiate");
var http = require("http");
var server = http.createServer(function (request, response) {
	process.stdout.write(
		request.method + " " + request.url + " HTTP/" + request.httpVersion + "\n" +
		sys.inspect(request.headers) + "\n\n"
	);
	
	if (request.url === "/blog") {
		var responses = negotiate.choose(variants, request);
		var best = responses[0];
		
		if (best.q > 0) {
			fs.readFile(best.filename, function (err, data) {
				if (err) {
					response.writeHead(500, "Internal Server Error");
					response.end();
				} else {
					var headers = {};
					if (best.type) headers["Content-Type"] = best.type + (best.charset ? ";charset=" + best.charset : '');
					if (best.length) headers["Content-Length"] = best.length;
					if (best.language) headers["Content-Language"] = best.language;
					if (best.encoding) headers["Content-Encoding"] = best.encoding;
					
					response.writeHead(200, headers);
					response.write(data, best.charset || "ASCII");
					response.end();
				}
			});
		} else {
			response.writeHead(406, "None Acceptable");
			response.end();
		}
	}
	
	// ...other url handling...
});
server.listen(8080);