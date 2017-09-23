'use strict';

const _ = require('lodash');

const Xyaml = require('./xyaml');

const xyaml = module.exports = new Xyaml();

xyaml.plugin(require('./plugins/types'));
xyaml.plugin(require('./plugins/include'));
xyaml.plugin(require('./plugins/download'));
