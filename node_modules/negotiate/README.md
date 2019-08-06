# Negotiate.js - HTTP Content Negotiation in JavaScript

Negotiate.js is a JavaScript implementation of proper HTTP content negotiation, and is designed to be compatible with Node.js's HTTP Request API.

## Content Negotiation?

Content negotiation is an optional feature of the HTTP protocol that allows for the automatic selection of the appropriate content representation of the requested resource based upon the attributes of the request and variants.

Still confused? More information about what is content negotiation and how it works can be found on Wikipedia at: [http://en.wikipedia.org/wiki/Content_negotiation](http://en.wikipedia.org/wiki/Content_negotiation)

Negotiate.js uses the preemptive negotiation algorithm defined in the original [HTTP 1.1 draft spec](http://cidr-report.org/ietf/all-ids/draft-ietf-http-v11-spec-00.txt). 

## Example

Let's say you have a blog, and you can get a list of the latest blog entries on your site using the path `/blog/`. Now, let's say you have two different forms of representing this same data: as a HTML document or a Atom feed.

In Negotiate.js, these different forms are called variants, and can be represented in JavaScript like so:

	var variants = [
		{
			"method" : "GET",                //responds only to GET requests
			"type" : "text/html",            //is an HTML document
			"language" : "en-ca",            //is written in Canadian English
			"charset" : "iso-8859-1",        //uses this charset
			"encoding" : null,               //is not encoded
			"quality" : 1.0,                 //is the best representation of this resource
			"length" : 36741,                //is this many bytes long
			"filename" : "blog.html"         //used by this example only, for locating the variant's file
		},
		{
			"method" : "GET",                //responds only to GET requests
			"type" : "application/atom+xml", //is an Atom feed
			"language" : "en",               //is written in generic English
			"charset" : "utf-8",             //uses the utf-8 charset
			"encoding" : "gzip",             //is compressed with gzip
			"quality" : 0.8,                 //is not as good quality as the HTML version
			"length" : 12987,                //is smaller then the HTML version
			"filename" : "blog.atom.gzip"    //used by this example only, for locating the variant's file
		}
	];

All of the above variant properties are optional, but you should at least specify the mime type as it tends to be the most important. Also, Negotiate.js will tend to put more weight on variants that have more known properties specified.

With the available variants for this resource (URL) defined, you can now use Negotiate.js to select the appropriate representation for an incoming HTTP request. 

	var request = {
		url : "/blog",
		method : "GET",
		headers : {
			"accept" : "application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5",
			"accept-language" : "en-US,en;q=0.8",
			"accept-encoding" : "gzip,deflate,sdch",
			"accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3"
		}
	};
	
	var responses = Negotiate.choose(variants, request);

With Node.js, this can be done with the following:

	var fs = require("fs");
	var negotiate = require("./negotiate");
	var http = require("http");
	var server = http.createServer(function (request, response) {
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

## API

### Negotiate.choose(variants, request)
#### Parameters
* `variants` An array of variant objects of the requested resource.
* `request` A request object with the HTTP request details.
#### Returns
A clone of the variants array, with a `q` (quality) property attached to each variant. The quality property is a number from 0 to 1 (percentage) that indicates how good of a choice that variant is for the requester. This array is sorted in order of how suitable the variant is for the requester, with the best choice as the first item.

## License

Negotiate.js is licensed under the FreeBSD License. 