'use strict';

// const proto = require('kit/proto');
const yamlx = global.yamlx = require('../lib');
const x = global.x = require('expect.js');

var d = global.d = yamlx.loadFile('test/data/config.yaml');

// console.log(d);
