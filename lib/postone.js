var spawn = require('child_process').spawn;
var rp = require('request-promise');
var Promise = require('bluebird');
var assert = require('assert');

exports.problem = 'Support POST /items with body that matches {name: "", value: ""}.\n'
    + 'add an express route for POST requests to /items and process the incoming message body.\n'
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
            testPost(function (err) {
                if (!err) {
                    testPassed = true;
                    proc.kill();
                } else {
                    console.log("making POST request yeilded error: "+ err);
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
            console.log("POST requests succeeded");
            cb(true);
        } else {
            console.log("validation didn't pass.\nstdout: " + stdoutData + "\nstderr: " + stderrData);
            cb(false);
        }
    });
}

function testPost(cb) {
    Promise.all([rp({
        uri: "http://localhost:3000/items",
        method: "POST",
        body: {
            name: "test01",
            value: "hi mom"
        },
        json: true
    }), rp({
        uri: "http://localhost:3000/items",
        method: "POST",
        body: {
            name: "test02",
            value: "hi dad"
        },
        json: true
    })]).then(function () {
        cb();
    }, function (err) {
        cb(err);
    });
}