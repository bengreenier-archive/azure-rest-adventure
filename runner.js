#!/usr/bin/env node
 
var adventure = require('adventure');
var shop = adventure('azure-rest-adventure');

shop.add('setup', function () { return require('./lib/setup') });
shop.add('scaffolded', function () { return require('./lib/scaffolded') });
shop.add('postone', function () { return require('./lib/postone') });
shop.add('postmany', function () { return require('./lib/postmany') });
shop.add('getone', function () { return require('./lib/getone') });
shop.add('getmany', function () { return require('./lib/getmany') });
shop.add('deleteone', function () { return require('./lib/deleteone') });
shop.add('deletemany', function () { return require('./lib/deletemany') });
shop.add('azure', function () { return require('./lib/azure') });

shop.execute(process.argv.slice(2));