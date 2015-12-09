"use strict";

class BaseCtrl{

    constructor(ctrlid) {
        this.ctrlid = ctrlid;
    }
}

class CtrlMgr{

    constructor() {
        this.mapCtrl = {};
    }

    addCtrl(ctrl) {
        if (!this.mapCtrl.hasOwnProperty(ctrl.ctrlid)) {
            this.mapCtrl[ctrl.ctrlid] = ctrl;
        }
    }

    procMain(req, res, next) {
        if (req.params.hasOwnProperty('ctrlid')) {

            if (this.mapCtrl.hasOwnProperty(req.params.ctrlid)) {
                this.mapCtrl[req.params.ctrlid].onProc(req, res, next);

                return ;
            }
        }

        res.result.send();

        next();
    }
}

var singleton = new CtrlMgr();

exports.BaseCtrl = BaseCtrl;

exports.singleton = singleton;

function init(serv) {
    serv.get('/:ctrlid', function (req, res, next) {
        singleton.procMain(req, res, next);
    });

    serv.post('/:ctrlid', function (req, res, next) {
        singleton.procMain(req, res, next);
    });
}

exports.init = init;