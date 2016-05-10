var fs = require('fs');
var path = require('path');

exports.problem = 'Setup a node project that includes express.\n'
    + 'Use `$ADVENTURE_COMMAND verify <path/to/application/directory>` to validate everythings good.';

exports.verify = function (args, cb) {
    var appPath = args[0];
    
    var foundPkgJson = false, foundMainEntry = false, foundExpress = false;
    fs.readdirSync(appPath).forEach(function (file) {
        if (file === "package.json") {
            foundPkgJson = true;
        }
    });
    fs.readdirSync(path.resolve(appPath, "node_modules")).forEach(function (file) {
        if (file === "express") {
            foundExpress = true;
        }
    });
    
    if (!foundPkgJson) {
        console.log("missing file package.json - run 'npm init' in your project directory");
        cb(false);
    }
    
    if (!foundExpress) {
        console.log("dependency 'express' not installed - run 'npm install --save express'");
        cb(false);
    }
    
    var pkgJson = JSON.parse(fs.readFileSync(path.resolve(appPath, "package.json")));
    
    if (foundExpress && typeof(pkgJson["dependencies"]["express"]) !== "string") {
        console.log("missing 'express' in package.json#dependencies");
        cb(false);
    }
    
    if (typeof(pkgJson["main"]) !== "string") {
        console.log("missing package.json#main - set this value to the filename of your entrypoint");
        cb(false);
    } else if (!fs.existsSync(path.resolve(appPath, pkgJson["main"]))) {
        console.log("missing file " + pkgJson["main"] + " (package.json#main) cannot find your entrypoint on disk");
        cb(false);
    }
    
    cb(true);
};