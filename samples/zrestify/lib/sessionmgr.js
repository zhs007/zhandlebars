"use strict";

var util = require('util');

var wordarr = 'abcdefghijklmnopqrstuvwxyz0123456789';

var MAX_TIME = 20 * 60 * 1000;

class BaseSession{
    constructor(sessionid) {
        this.sessionid = sessionid;
        this.lastts = Date.now();
    }

    save() {
    }
};

var SessionType = BaseSession;

class SessionMgr{

    constructor() {
        this.mapSession = {};

        //let smgr = this;
        //setInterval(function () {
        //    let ts = Date.now();
        //    for (let sid in smgr.mapSession) {
        //        if (ts - smgr.mapSession[sid].lastts > MAX_TIME) {
        //            smgr.mapSession[sid] = undefined;
        //        }
        //    }
        //}, 1000 * 60);
    }

    makeSessionID() {
        let sid = '';
        let max = wordarr.length;

        for (let i = 0; i < 32; ++i) {
            let c = Math.floor(Math.random() * max);

            sid += wordarr.slice(c, c + 1);
        }

        return sid;
    }

    makeValidSessionID() {
        let sid = this.makeSessionID();
        if (this.mapSession.hasOwnProperty(sid)) {
            return this.makeValidSessionID();
        }

        return sid;
    }

    newSession(req) {
        let sessionid = this.makeValidSessionID();
        let session = new SessionType(sessionid);
        this.mapSession[sessionid] = session;

        req.session = session;
        req.session = session;

        return session;
    }
}

var singleton = new SessionMgr();

function setSessionType(st) {
    SessionType = st;
}

function funcMain(req, res, next) {
    if (req.params.hasOwnProperty('token')) {
        if (singleton.mapSession.hasOwnProperty(req.params.token)) {
            req.session = singleton.mapSession[req.params.token];
            req.sessionid = req.params.token;
        }
        else {
            req.session = undefined;
            req.sessionid = '';
        }
    }
    else {
        req.session = undefined;
        req.sessionid = '';
    }

    next();
}

exports.singleton = singleton;

exports.BaseSession = BaseSession;

exports.setSessionType = setSessionType;
exports.funcMain = funcMain;