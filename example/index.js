var express = require('express');
var NodeCache = require('node-cache');
var bodyParser = require('body-parser');

var cache = new NodeCache();
var app = express();

app.post("/items", bodyParser.json(), function (req, res) {
    var items = [];
    
    if (!req.body) {
        return res.status(400).end();
    }
    
    if (!req.body.length) {
        items.push(req.body);
    } else {
        items.concat(req.body);
    }
    
    items.forEach(function (item) {
        if (!item.name || !item.value) {
            return res.status(400).end();
        }
        if (typeof(cache.get(item.name)) !== "undefined") {
            return res.status(400).end();
        }
        if (!cache.set(item.name, item.value)) {
            return res.status(500).end();
        }
    });
    
    res.status(200).end();
});

app.get("/items", function (req, res) {
    var pairs = [];
    cache.keys().forEach(function (key) {
        var val = cache.get(key);
        pairs.push({
            name: key,
            value: val
        });
    });
    res.send(pairs);
});

app.get("/items/:name", function (req, res) {
    var val = cache.get(req.params.name);
    if (typeof(val) === "undefined") {
        return res.status(404).end();
    }
    res.send({
        name: req.params.name,
        value: val
    });
});

app.delete("/items", function (req, res) {
    if (cache.getStats().keys === 0) {
        return res.status(404).end();
    }
    
    cache.flushAll();
    res.status(200).end();
});

app.delete("/items/:name", function (req, res) {
    if (typeof(cache.get(req.params.name)) === "undefined") {
        return res.status(404).end();
    }
    
    var removed = 1 === cache.del(req.params.name);
    if (removed) {
        res.status(200).end();
    } else {
        res.status(500).end();
    }
})

app.listen(3000, function () {
	console.log("listening on port 3000");
});