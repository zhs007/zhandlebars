"use strict";

class Result {

    constructor(res) {
        this.jsonobj = [];
        this.res = res;
    }

    send() {
        this.res.send(this.jsonobj);
    }

    pushRet(ret) {
        this.jsonobj.push(ret);
    }
};

function funcMain(req, res, next) {
    let result = new Result(res);
    res.result = result;

    next();
}

exports.Result = Result;

exports.funcMain = funcMain;