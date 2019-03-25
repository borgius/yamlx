'use strict';

const _ = require('lodash');

const YamlX = require('./yamlx');

const yamlx = module.exports = new YamlX();

yamlx.plugin(require('./plugins/eval'));
yamlx.plugin(require('./plugins/env'));
yamlx.plugin(require('./plugins/include'));
yamlx.plugin(require('./plugins/paths'));
yamlx.plugin(require('./plugins/download'));
yamlx.plugin(require('./plugins/types'));
yamlx.plugin(require('./plugins/relations'));
yamlx.plugin(require('./plugins/data'));
yamlx.plugin(require('./plugins/options'));
yamlx.plugin(require('./plugins/props'));
yamlx.plugin(require('./plugins/export'));
