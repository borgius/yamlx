'use strict';

const _ = require('lodash');
const fs = require('../utils/fs');
const jsyaml = require('js-yaml');
const path = require('path');

module.exports = {

  names: ['include', 'read'],

  commands: {

    read(name, val, type) {
      var self = this;
      if (type !== 'command' || !['read'].includes(val.command))
        return self;
      let filename = self.data.resolve(val.args[0]),
        ext = path.extname(filename);
      if (!fs.exists(filename)) return '';
      return fs.read(filename);
    },

    include(name, val, type) {
      var self = this;
      if (type !== 'command' || !['include', 'import'].includes(val.command))
        return self;
      let filename = val.args[0].startsWith('http') ?
        val.args[0] :
        self.data.resolve(val.args[0]),
        ext = path.extname(filename);
      if (!fs.exists(filename) && !filename.startsWith('http'))
        return '';
      if (['.yaml', '.yamlx', '.cml'].includes(ext)) {
        let data = self.Data.loadFile(filename, {
          name,
          parent: self.data,
        });
        return data;
      }
      if (ext === '.js') {
        try {
          return require(filename);
        } catch (err) {
          return fs.read(filename);
        }
      }
      if (ext === '.json') {
        try {
          return jsyaml.safeLoad(fs.read(filename));
        } catch (err) {
          return fs.read(filename);
        }
      }
      return fs.read(filename);
    },

  },
};
