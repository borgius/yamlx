'use strict';

const _ = require('lodash');

const Xyaml = require('./xyaml');

const xyaml = module.exports = new Xyaml();

xyaml.plugin(require('./plugins/eval'));
xyaml.plugin(require('./plugins/types'));
xyaml.plugin(require('./plugins/include'));
xyaml.plugin(require('./plugins/download'));
xyaml.plugin(require('./plugins/relations'));
xyaml.plugin(require('./plugins/data'));
xyaml.plugin(require('./plugins/options'));
xyaml.plugin(require('./plugins/props'));
