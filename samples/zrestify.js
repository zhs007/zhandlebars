"use strict";

var zhandlebars = require('../lib/index');

let params = {projname: 'test'};
zhandlebars.procProj(params, './template/main.json', './template');