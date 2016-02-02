/* global require, global, process */

var cluster = require('cluster');
var express = require('express');
var bodyParser = require('body-parser');


if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

// Code to run if we're in a worker process
} else {
    var app = express();

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}));

    // parse application/json
    app.use(bodyParser.json());

    app.use('/public', express.static('public'));

    app.get('/', function (req, res) {
        res.redirect('/public/index.html');
    });

    app.post('/login', function (req, res) {
        res.sendfile('./public/dashboard.html');
    });

    var server = app.listen(3000, function () {
        console.log('Listening on port %d', server.address().port);
    });
}

// Listen for dying workers
cluster.on('exit', function (worker) {

    // Replace the dead worker,
    // we're not sentimental
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();

});

process.setMaxListeners(0);

process.on('uncaughtException', function (err) {
    if (err.errno === 'EADDRINUSE') {
        console.log('Address in use. Exiting...');
        process.exit();
    }
    else {
        console.log(err);
    }
});