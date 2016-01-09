"use strict";

var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var glob = require('glob');

function makedir(dir) {
    let arr = dir.split(path.sep);
    let cur = '.';
    for (let ii = 0; ii < arr.length; ++ii) {
        cur = path.join(cur, arr[ii]);
        if (!fs.existsSync(cur)) {
            fs.mkdirSync(cur);
        }
    }
}

function procFile(name, src, params) {
    let fobj = path.parse(name);
    makedir(fobj.dir);
    let buf = fs.readFileSync(src, 'utf-8');

    let tmp = handlebars.compile(buf);
    let bufout = tmp(params);

    fs.writeFileSync(name, bufout);
}

function procBinFile(name, src, params) {
    let fobj = path.parse(name);
    makedir(fobj.dir);
    let buf = fs.readFileSync(src, 'binary');

    fs.writeFileSync(name, buf);
}

function procJson(params, filename, tmpdir) {
    let bufjson = fs.readFileSync(path.join(filename), 'utf-8');
    let tmpjson = handlebars.compile(bufjson);
    let bufout = tmpjson(params);
    let objout = JSON.parse(bufout);

    let ret = [];
    for (let ii = 0; ii < objout.length; ++ii) {
        let cur = objout[ii];
        if (cur.type == 'dir') {
            ret.push(cur);
        }
        else {
            let srcfilename = path.join(tmpdir, cur.src);
            if (fs.existsSync(srcfilename)) {
                cur.src = srcfilename;
                ret.push(cur);
            }
            else {
                let arr = glob.sync(srcfilename);
                for (let jj = 0; jj < arr.length; ++jj) {
                    let cc = {name: path.join(path.dirname(cur.name), path.basename(arr[jj])), src: arr[jj], type: cur.type};
                    ret.push(cc);
                }
            }
        }
    }

    return ret;
}

function procProj(params, jsonfile, tmpdir) {
    let objJson = procJson(params, jsonfile, tmpdir);
    for (let ii = 0; ii < objJson.length; ++ii) {
        if (objJson[ii].type == 'dir') {
            makedir(objJson[ii].name);
        }
        else if (objJson[ii].type == 'binfile') {
            procBinFile(objJson[ii].name, objJson[ii].src, params);
        }
        else {
            procFile(objJson[ii].name, objJson[ii].src, params);
        }
    }
}

exports.procProj = procProj;