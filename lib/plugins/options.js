'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('../utils/fs');

module.exports = {

  methods: {

    option(name, val) {
      var self = this;
      if (!arguments.length)
        return _.clone(self._opts);
      if (arguments.length === 2) {
        _.set(self._opts, name, val);
        return self;
      }
      if (typeof name === 'object') {
        _.each(name, (val, name) => {
          self.option(name, val);
        });
        return self;
      }
      return _.get(self._opts, name);
    },

    options(...args) {
      return this.option(...args);
    },

    getDirname() {
      var self = this;
      return path.dirname(self.getFilename());
    },

    getFilename() {
      var self = this;
      return self.option('filename');
    },

    resolve(p) {
      var self = this,
        dir = _.trimEnd(self.getDirname(), '/');
      if (dir.startsWith('https://') || dir.startsWith('http://')) {
        return `${dir}/${p}`;
      }
      let filename = path.resolve(dir, p);
      if (!fs.exists(filename)) {
        ['yaml', 'yamlx', 'cml'].forEach(ext => {
          if (!fs.exists(`${filename}.${ext}`)) return;
          filename = `${filename}.${ext}`;
        });
      }
      return filename;
    },

  },

};
