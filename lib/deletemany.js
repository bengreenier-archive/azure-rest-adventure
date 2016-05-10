var spawn = require('child_process').spawn;
var rp = require('request-promise');
var Promise = require('bluebird');
var assert = require('assert');

exports.problem = 'Support DELETE /items and expect an empty response body.\n'
    + 'add an express route for DELETE requests to /items and respond status code 200 if removed, 404 if not found, and 500 if internal error.\n'
    + 'Use `$ADVENTURE_COMMAND verify <path/to/entry/point.js>` to validate.';

exports.verify = function (args, cb) {
    if (!/.js/.test(args)) {
        console.log("entrypoint path must end in .js");
        return cb(false);
    }
    
    var proc = spawn('node', [args]), serviceRunning = false, testPassed = false;
    
    setTimeout(function () {
        proc.kill();
    }, 5000);
    
    var stdoutData = "";
    proc.stdout.on('data', function (data) {
        stdoutData += data;
        
        if (/^listening on.+3000/.test(stdoutData)) {
            serviceRunning = true;
            testDeletes(function (err) {
                if (!err) {
                    testPassed = true;
                    proc.kill();
                } else {
                    console.log("making requests yeilded error: "+ err);
                    proc.kill();
                }
            });
        }
    });
    
    var stderrData = "";
    proc.stderr.on('data', function (data) {
        stderrData += data;
    })
    
    proc.on('close', function () {
        if (testPassed) {
            console.log("requests succeeded");
            cb(true);
        } else {
            console.log("validation didn't pass.\nstdout: " + stdoutData + "\nstderr: " + stderrData);
            cb(false);
        }
    });
}

function testDeletes(cb) {
    rp({
        uri: "http://localhost:3000/items",
        method: "DELETE",
        json: true,
        simple: false,
        transform: function (body, res) {
            return res.statusCode === 404;
        }
    }).then(function (res) {
        assert.ok(res, "expected 404 status code for /items");
        
        return rp({
            uri: "http://localhost:3000/items",
            method: "POST",
            body: {
                name: "test01",
                value: "hi mom"
            },
            json: true
        });
    }).then(function () { 
        return rp({
            uri: "http://localhost:3000/items",
            method: "DELETE",
            json: true,
            simple: false,
            transform: function(body, res) {
                return res.statusCode === 200;
            }
        });
    }).then(function (res) {
        assert.ok(res, "expected 200 status code for /items");
        cb();
    }).catch(function (err) {
        cb(err);
    });
}