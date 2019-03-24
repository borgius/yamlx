'use strict';

const _ = require('lodash');
const fs = require('../utils/fs');
const jsyaml = require('js-yaml');
const path = require('path');

module.exports = {

  names: ['path'],

  commands: {

    path (name, val, type) {
      var self = this;
      if (type !== 'command' || !['path', 'resolve'].includes(val.command))
        return self;
      return self.data.resolve(val.args[0]);
    },

  },
};
