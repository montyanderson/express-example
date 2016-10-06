const bluebird = require("bluebird");
const fs = require("fs");
const express = require("express");
const Hogan = require("hogan.js"); /* mustache library written by twitter */

bluebird.promisifyAll(fs);

/*
Bluebird is a super fast implementation of Promises.
It allows you to transform old callback-style functions to new ones that return Promises!

using normal callbacks

fs.readFile(__dirname + "/index.html", function(err, data) {
	console.log(err || data.toString());
});

but with Promises!

fs.readFileAsync(__dirname + "/index.html")
.then(function(data) {
	console.log(data.toString())
})
.catch(function(err) {
	consoe.log(err);
});

or with arrow functions

fs.readFileAsync(__dirname + "/index.html")
.then(data => {
	console.log(data.toString())
})
.catch(err => {
	consoe.log(err);
});
*/

/*
Arrow functions are exactly like normal functions,
except they cannot be used as object factories, and use
the 'this' of the parent block;
*/

const app = express();

app.engine("mustache", (filePath, options, callback) => {
	let view, layout;

	fs.readFileAsync(filePath, "utf8")
	.then(data => {
		view = data;

		const layoutPath = options.settings.views + "/" + options.layout + ".mustache";

		if(options.layout) {
			return fs.readFileAsync(layoutPath, "utf8")
			.then(data => layout = data);
		}
	})
	.then(() => {
		let rendered = Hogan.compile(view).render(options);

		if(layout) {
			options.view = rendered;
			rendered = Hogan.compile(layout).render(options);
		}

		callback(null, rendered);
	})
	.catch(err => callback(err));
});

app.set("views", __dirname + "/views");
app.set("view engine", "mustache");

app.get("/", (req, res) => {
	res.render("index", { layout: "layout" });
});

app.get("/json", (req, res) => {
	res.end(JSON.stringify({
		number: Math.random(),
		bool: true,
		obj: {
			obj: {
				existance: false
			}
		}
	}));
});

app.listen(8080);
