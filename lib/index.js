"use strict";

var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var glob = require('glob');

function procOverWrite(overwrite) {
    if (overwrite == 'w' || overwrite == 'r' || overwrite == 'rw') {
        return overwrite;
    }

    return 'w';
}

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

// {tagname: str}
function getTagInfo(buff) {
    let robj = {};
    let pos = 0;
    let bi = -1;
    let ckey = '';
    let cinfo = '';

    do{
        bi = buff.indexOf('//<--', pos);
        if (bi >= 0) {
            let kbi = buff.indexOf(' Begin', bi);
            if (kbi < 0) {
                return robj;
            }

            ckey = buff.substr(bi, kbi - bi);

            let ei = buff.indexOf('//<--' + ckey + ' End', kbi);
            if (ei < 0) {
                return robj;
            }

            cinfo = buff.substr(kbi + 6, ei - kbi - 6);

            robj[ckey] = cinfo;

            pos = kbi + 5 + ckey.length + 4;
        }
    }while(bi >= 0);

    return robj;
}

function procTagBuff(buff, tagname, str) {
    let dest = '';
    let pos = 0;

    let bi = buff.indexOf('//<--' + tagname + ' Begin', pos);
    if (bi < 0) {
        return buff;
    }

    dest += buff.substr(0, bi + 5 + tagname.length + 6);
    dest += str;

    let ei = buff.indexOf('//<--' + tagname + ' End', bi);
    if (ei < 0) {
        return buff;
    }

    dest += buff.substr(ei, buff.length - ei);

    return dest;
}

function procFile(name, src, params, overwrite) {
    let fobj = path.parse(name);
    let hasfile = false;
    makedir(fobj.dir);

    if (fs.existsSync(name)) {
        hasfile = true;

        if (overwrite == 'r') {
            return ;
        }
    }

    let buf = fs.readFileSync(src, 'utf-8');

    let tmp = handlebars.compile(buf);
    let bufout = tmp(params);

    if (hasfile) {
        if (overwrite == 'rw') {
            return ;
        }

        let destbuf = fs.readFileSync(name, 'utf-8');

        let tagobj = getTagInfo(destbuf);
        for (let key in tagobj) {
            bufout = procTagBuff(bufout, key, tagobj[key]);
        }
    }

    fs.writeFileSync(name, bufout);
}

function procBinFile(name, src, params, overwrite) {
    let fobj = path.parse(name);
    makedir(fobj.dir);

    if (fs.existsSync(name)) {
        if (overwrite == 'r') {
            return ;
        }
    }

    let buf = fs.readFileSync(src, 'binary');

    fs.writeFileSync(name, buf, 'binary');
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
                let overwrite = 'w';
                if (cur.hasOwnProperty('overwrite')) {
                    overwrite = procOverWrite(cur.overwrite);
                }

                let arr = glob.sync(srcfilename);
                for (let jj = 0; jj < arr.length; ++jj) {
                    let cc = {name: path.join(path.dirname(cur.name), path.basename(arr[jj])), src: arr[jj], type: cur.type, overwrite: overwrite};
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
        if (objJson[ii].hasOwnProperty('jscode')) {
            eval(objJson[ii].jscode);
        }

        let overwrite = 'w';
        if (objJson[ii].hasOwnProperty('overwrite')) {
            overwrite = procOverWrite(objJson[ii].overwrite);
        }

        if (objJson[ii].type == 'dir') {
            makedir(objJson[ii].name);
        }
        else if (objJson[ii].type == 'binfile') {
            procBinFile(objJson[ii].name, objJson[ii].src, params, overwrite);
        }
        else {
            procFile(objJson[ii].name, objJson[ii].src, params, overwrite);
        }
    }
}

exports.procProj = procProj;