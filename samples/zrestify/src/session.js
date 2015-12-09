"use strict";

var sessionmgr = require('../lib/sessionmgr');

class Session extends sessionmgr.BaseSession {

    constructor() {
        super();
    }
};

sessionmgr.setSessionType(Session);

exports.Session = Session;