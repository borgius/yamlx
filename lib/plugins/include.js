'use strict';

const _ = require('lodash');
const fs = require('kit/fs');
const jsyaml = require('js-yaml');
const path = require('path');

module.exports = {

  names: ['include'],

  include (name, val, type) {
    var self = this;
    if (type !== 'command' || !['include', 'import', 'read'].includes(val.command))
      return self;
    let filename = val.args[0].startsWith('http')
      ? val.args[0]
      : self.data.resolve(val.args[0]),
      ext = path.extname(filename);
    if (!fs.exists(filename) && !filename.startsWith('http'))
      return '';
    if (['.yaml', '.xyaml', '.cml'].includes(ext)) {
      let data = self.Data.loadFile(filename, {
        name,
        parent: self.data,
      });
      return data;
    }
    if (ext === '.js') {
      try {
        return require(filename);
      } catch(err) {
        return fs.read(filename);
      }
    }
    if (ext === '.json') {
      try {
        return jsyaml.safeLoad(fs.read(filename));
      } catch(err) {
        return fs.read(filename);
      }
    }
    return fs.read(filename);
  },
};
