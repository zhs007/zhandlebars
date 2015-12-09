"use strict";

var winston = require('winston');
var config = require('../config');

winston.loggers.add('dev', {
    console: {
        level: 'silly',
        colorize: 'true',
        label: 'dev'
    },
    file: {
        filename: config.logdev_path
    }
});

winston.loggers.add('normal', {
    console: {
        level: 'silly',
        colorize: 'true',
        label: 'normal'
    },
    file: {
        filename: config.log_path
    }
});

var logNormal = winston.loggers.get('normal');
var logDev = winston.loggers.get('dev');

function log(level, msg) {
    var args = Array.prototype.slice.call(arguments, 2);

    while(args[args.length - 1] === null) {
        args.pop();
    }

    var meta = [];
    for (var i = 0; i < args.length; ++i) {
        meta.push(args[i]);
    }

    if (meta.length > 0) {
        logNormal.log(level, msg, {meta: meta});
    }
    else {
        logNormal.log(level, msg);
    }
}

function dev(level, msg) {
    if (!config.openLogDev) {
        return ;
    }

    var args = Array.prototype.slice.call(arguments, 2);

    while(args[args.length - 1] === null) {
        args.pop();
    }

    var meta = [];
    for (var i = 0; i < args.length; ++i) {
        meta.push(args[i]);
    }

    if (meta.length > 0) {
        logDev.log(level, msg, {meta: meta});
    }
    else {
        logDev.log(level, msg);
    }
}

exports.dev = dev;
exports.log = log;