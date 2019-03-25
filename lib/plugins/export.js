'use strict';

const _ = require('lodash');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const {
  maxProcessed,
} = require('../utils/const');

module.exports = {

  names: ['export'],

  commands: {

    export (name, val, type) {
      var self = this;
      if (type !== 'command' || !['export', 'exportJSON', 'exportYAML'].includes(val.command))
        return self;
      if (self.processed < maxProcessed) return undefined;
      let parentName = self.data.getParentName(self.fullName);
      let fname;
      if (val.args.length === 1) {
        fname = val.args[0];
      } else {
        [parentName, fname] = val.args;
      }
      fname = path.normalize(path.dirname(self.data._opts.filename) + `/${fname}`);
      const isJSON = val.command.indexOf('JSON') !== -1 || fname.indexOf('.json') !== -1;
      // remove self
      self.data.del.call(self.data, self.data.findProp.call(self.data, null, self.fullName));
      const field = self.data.findProp.call(self.data, null, parentName);
      const data = self.data.getData.call(self.data, field);

      if (!fs.existsSync(path.dirname(fname))) {
        fs.mkdirSync(path.dirname(fname));
      }
      fs.writeFileSync(fname, isJSON ? JSON.stringify(data, null, 2) : yaml.safeDump(data));
    },

  },

};
