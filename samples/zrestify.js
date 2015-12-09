"use strict";

var path = require('path');
var zhandlebars = require('../lib/index');

let params = {projname: 'test', projname_lc: 'test'};
zhandlebars.procProj(params, path.join(__dirname, './zrestify.json'), path.join(__dirname, './'));