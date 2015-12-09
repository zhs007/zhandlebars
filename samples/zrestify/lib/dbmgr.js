"use strict";

var assert = require('assert');
var mysql = require('mysql');
var util = require('util');
var log = require('./logger');

const DBCONNECT_NO            = -1;   // 需要connect
const DBCONNECT_CONNECTING    = 0;    // connect中
const DBCONNECT_CONNECTED     = 1;    // connected

class DBClient{
    constructor() {
        this.cfg = undefined;
        this.dbcon = undefined;

        this.stateConnect = DBCONNECT_NO;

        this.curSQL = undefined;
        this.dbid = undefined;
    }

    init(dbid, host, user, password, database, callback) {
        assert.ok(this.cfg == undefined || this.dbcon == undefined, 'mysql already init.');

        this.dbid = dbid;

        this.cfg = {
            host : host,
            user : user,
            password : password,
            database : database
        };

        log.log('info', util.format('mysql(%s) init %s %s@%s password is %s', dbid, database, user, host, password));

        callback();
    }

    // 连接数据库
    connect(funcOnConnect) {
        let dbclient = this;

        if (dbclient.stateConnect == DBCONNECT_NO) {
            dbclient.stateConnect = DBCONNECT_CONNECTING;

            log.log('info', util.format('mysql connect %j', dbclient.cfg));

            dbclient.curSQL = undefined;

            dbclient.dbcon = mysql.createConnection(dbclient.cfg);

            dbclient.dbcon.on('error', function (err) {
                dbclient.onDBError(err);
            });

            dbclient.dbcon.connect(function (err) {
                if (err) {
                    dbclient.stateConnect = DBCONNECT_NO;

                    log.log('error', util.format('mysql connect error %j', err));

                    setTimeout(function () {
                        dbclient.connect(funcOnConnect);
                    }, 5000);

                    return ;
                }

                dbclient.stateConnect = DBCONNECT_CONNECTED;

                if (funcOnConnect != undefined) {
                    funcOnConnect();
                }
            });
        }
        else if (dbclient.stateConnect == DBCONNECT_CONNECTED) {
            if (funcOnConnect != undefined) {
                funcOnConnect();
            }
        }
    }

    reconnect(funcOnReconnect) {
        let dbclient = this;
        if (dbclient.stateConnect == DBCONNECT_CONNECTED) {
            dbclient.curSQL = undefined;

            dbclient.dbcon.end(function (err) {
                if (err) {
                    log.log('error', util.format('mysql connect error %j', err));
                }

                dbclient.stateConnect = DBCONNECT_NO;

                dbclient.connect(funcOnReconnect);
            });
        }
        else if (dbclient.stateConnect == DBCONNECT_NO) {
            dbclient.connect(funcOnReconnect);
        }
    }

    onDBError(err) {
        let dbclient = this;
        if (err) {
            log.log('error', util.format('mysql connect error %j', err));

            if (dbclient.curSQL != undefined) {
                log.log('error', util.format('error query sql is %s', dbclient.curSQL));
            }

            // 如果是连接断开，自动重新连接
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                dbclient.stateConnect = DBCONNECT_NO;

                dbclient.reconnect();
            }
            else {
                setTimeout(function () {
                    dbclient.reconnect();
                }, 5000);
            }
        }
    }

    query(sql, funcOnQuery) {
        let dbclient = this;
        dbclient.connect(function () {
            dbclient.curSQL = sql;
            dbclient.dbcon.query(sql, function (err, rows, fields) {
                if (err) {
                    if (err.code == 'ETIMEDOUT') {
                        dbclient.stateConnect = DBCONNECT_NO;

                        dbclient.query(sql, funcOnQuery);

                        return ;
                    }

                    log.log('error', util.format('DBClient query(%s) err is %j', sql, err));
                }

                funcOnQuery(err, rows, fields);
            });
        });
    }

    _queryList(sqlarr, begin, max, result, func) {
        let dbclient = this;
        if(begin >= max) {
            func(result);

            return ;
        }

        dbclient.curSQL = sqlarr[begin];

        dbclient.dbcon.query(sqlarr[begin], function (err, rows, fields) {
            if (err) {
                if (err.code == 'ETIMEDOUT') {
                    dbclient.stateConnect = DBCONNECT_NO;

                    dbclient._queryList(sqlarr, begin, max, result, func);

                    return ;
                }

                log.log('error', util.format('DBClient _queryList(%s) err is %j', dbclient.curSQL, err));
            }

            result[begin] = {err: err, rows: rows, fields: fields};
            dbclient._queryList(sqlarr, begin + 1, max, result, func);
        });
    }

    // onQueryList(results as [{err, rows, fields},...])
    queryList(sqlarr, funcOnQueryList) {
        let dbclient = this;
        dbclient.connect(function () {
            let max = sqlarr.length;
            let i = 0;
            let result = [];

            dbclient._queryList(sqlarr, i, max, result, funcOnQueryList);
        });
    }

    isValidResult(rows, name) {
        return typeof (rows) != 'undefined' && rows.length > 0 && rows[0].hasOwnProperty(name) && rows[0][name] !== null;
    }
};

var mapDBClient = {};

function getDBClient(dbid) {
    if (mapDBClient.hasOwnProperty(dbid)) {
        return mapDBClient[dbid];
    }

    return undefined;
}

function newDBClient(dbid, host, user, password, database, callback) {
    let dbclient = new DBClient();
    mapDBClient[dbid] = dbclient;

    dbclient.init(dbid, host, user, password, database, callback);
}

exports.getDBClient = getDBClient;
exports.newDBClient = newDBClient;