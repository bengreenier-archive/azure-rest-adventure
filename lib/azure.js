var url = require('url');
var rp = require('request-promise');
var assert = require('assert');

exports.problem = 'Deploy the project to azure.\n'
    + 'Use `$ADVENTURE_COMMAND verify <protocol://azure.service.url>` to validate everythings good.\n'
    + 'Note: validating this solution will attempt to DELETE ALL ITEMS from the service.\n'
    + '\n'
    + 'Hint: see https://azure.microsoft.com/en-us/documentation/articles/web-sites-deploy';

exports.verify = function (args, cb) {
    var azureUri = args[0];
    
    rp({
        uri: url.resolve(azureUri, "/items"),
        method: "DELETE"
    }).then(rp({
        uri: url.resolve(azureUri, "/items"),
        method: "POST",
        body: {
            name: "test01",
            value: "test01"
        },
        json: true
    })).then(rp({
        uri: url.resolve(azureUri, "/items"),
        method: "POST",
        body: [
            {
                name: "test02",
                value: "hi there"
            },
            {
                name: "test03",
                value: "hi2"
            }
        ],
        json: true
    })).then(rp({
        uri: url.resolve(azureUri, "/items/test01"),
        method: "GET",
        json: true
    })).then(function (res) {
        assert.deepEqual(res, {
            name: "test01",
            value: "test01"
        });
    }).then(rp({
        uri: url.resolve(azureUri, "/items"),
        method: "GET",
        json: true
    })).then(function (res) {
        assert.deepEqual(res, [
            {
                name: "test01",
                value: "test01"
            },
            {
                name: "test02",
                value: "hi there"
            },
            {
                name: "test03",
                value: "hi2"
            }
        ]);
    }).then(rp({
        uri: url.resolve(azureUri, "/items/test02"),
        method: "DELETE"
    })).then(rp({
        uri: url.resolve(azureUri, "/items"),
        method: "GET",
        json: true
    })).then(function (res) {
        assert.deepEqual(res, [
            {
                name: "test01",
                value: "test01"
            },
            {
                name: "test03",
                value: "hi2"
            }
        ]);
    }).then(rp({
        uri: url.resolve(azureUri, "/items"),
        method: "DELETE"
    })).then(function () {
        cb(true);
    }).catch(function (err) {
        console.log("error making requests " + err);
        cb(false);
    });
};