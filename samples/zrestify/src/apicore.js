"use strict";

var ctrldef = require('./ctrldef');
var ctrlmgr = require('../lib/ctrlmgr');

function sendMsg_Common(res, cmd, isok) {
    res.result.pushRet({cmd: ctrldef.CTRLID_RES_COMMON, srccmd: cmd, isok: isok});
}

function sendMsg_ServCtrl(res, notify, type) {
    res.result.pushRet({cmd: ctrldef.CTRLID_RES_SERVCTRL, info: notify, type: type});
}

function sendMsg_Token(res, token) {
    res.result.pushRet({cmd: ctrldef.CTRLID_RES_TOKEN, token: token});
}

exports.sendMsg_Common = sendMsg_Common;
exports.sendMsg_ServCtrl = sendMsg_ServCtrl;
exports.sendMsg_Token = sendMsg_Token;


class BaseAPICtrl extends ctrlmgr.BaseCtrl {

    constructor(ctrlid, needlogin, arrparam) {
        super(ctrlid);

        this.needlogin = needlogin;
        this.param = arrparam;
    }

    procParams(req, res) {
        if (arguments.length > 2) {

            for (let i = 0; i < this.param.length; ++i) {
                if (!req.params.hasOwnProperty(this.param[i])) {

                    sendMsg_ServCtrl(res, '缺少参数' + this.param[i], 'msgbox');
                    sendMsg_Common(res, req.params.ctrlid, false);

                    return false;
                }
            }
        }

        return true;
    }

    procSession(req, res) {
        if (this.needlogin) {
            let session = req.session;
            if (session == undefined) {
                sendMsg_ServCtrl(res, 'token参数错误。', 'msgbox');
                sendMsg_Common(res, res.params.ctrlid, false);

                return false;
            }

            if (session.admininfo == undefined) {
                sendMsg_ServCtrl(res, '请先登录。', 'msgbox');
                sendMsg_Common(res, res.params.ctrlid, false);

                return false;
            }
        }

        return true;
    }

    procMain(req, res, next) {
        if (!this.procSession(req, res)) {
            res.result.send();

            next();

            return ;
        }

        if (!this.procParams(req, res)) {
            res.result.send();

            next();

            return ;
        }

        this.onProc(req, res, next);
    }

    onProc(req, res, next) {

    }
}

exports.BaseAPICtrl = BaseAPICtrl;