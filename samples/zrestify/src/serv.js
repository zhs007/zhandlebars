"use strict";

var util = require('util');
var restify = require('restify');
var config = require('../config');
var dbmgr = require('../lib/dbmgr');
var log = require('../lib/logger');
var result = require('../lib/result');
var sessionmgr = require('../lib/sessionmgr');
var ctrlmgr = require('../lib/ctrlmgr');

require('../ctrl/login');

var serv = restify.createServer({
    name: config.appname,
    version: config.ver
});

serv.use(restify.acceptParser(serv.acceptable));
serv.use(restify.queryParser());
serv.use(restify.bodyParser());
serv.use(result.funcMain);
serv.use(sessionmgr.funcMain);

ctrlmgr.init(serv);

dbmgr.newDBClient('{{projname_lc}}', config.db_host, config.db_user, config.db_pwd, config.db_name, function () {
    serv.listen(config.service_port, function () {
        log.log('info', util.format('%s listening at %s', serv.name, serv.url));
    });
});

exports.serv = serv;