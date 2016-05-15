var spawn = require('child_process').spawn;

exports.problem = 'Scaffold the project using express, and start listening on port 3000.\n'
    + 'Use `$ADVENTURE_COMMAND verify <path/to/entry/point.js>` to validate everythings running.\n'
    + '\n'
    + 'Hint: consume packages in code with `var package = require("<packageName>");`\n'
    + 'Hint: View the express docs at http://expressjs.com/en/4x/api.html\n'
    + 'Hint: Check out the docs for Application#listen\n';
    + 'Hint: Check out the package `node-cache` (helpful for the coming lessons)';

exports.verify = function (args, cb) {
    if (!/.js/.test(args)) {
        console.log("entrypoint path must end in .js");
        return cb(false);
    }
    
    var proc = spawn('node', [args]), testPassed = false;
    
    setTimeout(function () {
        proc.kill();
    }, 5000);
    
    var stdoutData = "";
    proc.stdout.on('data', function (data) {
        stdoutData += data;
        
        if (/^listening on.+3000/.test(stdoutData)) {
            testPassed = true;
            proc.kill();
        }
    });
    
    var stderrData = "";
    proc.stderr.on('data', function (data) {
        stderrData += data;
    })
    
    proc.on('close', function () {
        if (testPassed) {
            console.log("found 'listening on ... 3000' message in stdout:\n" + stdoutData);
            cb(true);
        } else {
            console.log("validation didn't pass.\nstdout: " + stdoutData + "\nstderr: " + stderrData);
            cb(false);
        }
    });
};