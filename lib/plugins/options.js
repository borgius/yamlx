'use strict';

const _ = require('plp/rextend')(require('lodash'), [
  'flatten',
  'aliases',
  'trim',
]);
const path = require('path');
const fs = require('kit/fs');

module.exports = {

  methods: {

    getOptions (name, val) {
      var self = this;
      if (!arguments.length)
        return _.clone(self._opts);
      if (arguments.length === 2) {
        _.set(self._opts, name, val);
        return self;
      }
      if (typeof name === 'object') {
        _.each(name, (val, name) => {
          self.getOptions(name, val);
        });
        return self;
      }
      return _.get(self._opts, name);
    },

    getDirname () {
      var self = this;
      return path.dirname(self.getFilename());
    },

    getFilename () {
      var self = this;
      return self.option('filename');
    },

    resolve (p) {
      var self = this,
        dir = _.trim.right(self.getDirname(), '/');
      if (dir.startsWith('https://') || dir.startsWith('http://')) {
        return `${dir}/${p}`;
      }
      let filename = path.resolve(dir, p);
      if (!fs.exists(filename)) {
        ['yaml', 'xyaml', 'cml'].forEach(ext => {
          if (!fs.exists(`${filename}.${ext}`)) return;
          filename = `${filename}.${ext}`;
        });
      }
      return filename;
    },

  },

};

_.aliases.enum(module.exports.methods, {
  'getOptions': ['option', 'options'],
})
