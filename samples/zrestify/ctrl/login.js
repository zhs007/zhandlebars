"use strict";

var ctrlmgr = require('../lib/ctrlmgr');
var ctrldef = require('../src/ctrldef');
var apicore = require('../src/apicore');
var adminmgr = require('../src/adminmgr');
var sessionmgr = require('../lib/sessionmgr');
var fs = require("fs");
//<--require Begin
//<--require End

class Ctrl_Login extends apicore.BaseAPICtrl {
    constructor() {
        super(ctrldef.CTRLID_REQ_LOGIN, false, ['name', 'password']);
    }

    onProc(req, res, next) {
        // login

        // if is ok
        sessionmgr.singleton.newSession(req);

        apicore.sendMsg_Token(res, req.session.sessionid);
        apicore.sendMsg_Common(res, req.params.ctrlid, true);

        res.result.send();

//<--onProc Begin
        next();
//<--onProc End
    }
}

ctrlmgr.singleton.addCtrl(new Ctrl_Login());