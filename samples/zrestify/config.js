"use strict";

var util = require('util');
var fs = require("fs");
var strPackage = fs.readFileSync('./package.json').toString();
var pkg = JSON.parse(strPackage);

var timestamp = Date.now();

exports.ver = pkg.version;

exports.service_port = {{port}};
exports.appname = '{{projname}}';

exports.log_path = util.format('./%s.log', timestamp);
exports.logdev_path = util.format('./%s.dev.log', timestamp);

exports.openLogDev = true;

exports.db_host = 'db host';
exports.db_user = 'db user';
exports.db_pwd = 'db password';
exports.db_name = 'db name';
