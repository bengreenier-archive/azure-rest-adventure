var spawn = require('child_process').spawn;
var rp = require('request-promise');
var Promise = require('bluebird');
var assert = require('assert');

exports.problem = 'Support GET /items and expect a response body that matches [{name: "", value: ""}...] where "..." indicates many possible array entries that look the same.\n'
    + 'add an express route for GET requests to /items and respond with all items as an array./\n'
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
            testGets(function (err) {
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

function testGets(cb) {
    rp({
        uri: "http://localhost:3000/items",
        method: "GET",
        json: true
    }).then(function (res) {
        assert.deepEqual(res, []);
        
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
            method: "GET",
            json: true
        });
    }).then(function (res) {
        assert.deepEqual(res, [
            {name: "test01", value: "hi mom"}
        ]);
        cb();
    }).catch(function (err) {
        cb(err);
    });
}