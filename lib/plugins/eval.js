'use strict';

const _ = require('plp/rextend')(require('lodash'), [
  'expression',
]);

module.exports = {

  names: ['interpolate', 'commands'],

  commands: {

    interpolate (name, val, type) {
      var self = this;
      if (type !== 'string') return self;
      return self.data.interpolate(val, self.fullName);
    },

    commands (name, val, type) {
      var self = this;
      if (typeof val !== 'string' || !val.startsWith('~')) {
        return self;
      }
      let parts = val.split('('),
        command = parts[0].slice(1),
        arg = _.trim(parts[1] || '', ')');
      self.type = 'command';
      return {
        command: command,
        val: arg,
        args: arg
          .split(',')
          .map(s => s.trim())
          .filter(s => !!s) || [],
      };
    },

  },

  methods: {

    interpolate (val, name) {
      var self = this;
      if (val.startsWith('${') && val.endsWith('}') && val.split('${').length === 2) {
        return self.expression(val.slice(2, -1), name);
      }
      return val.replace(/\$\{(.+?)\}/mgi, (txt, val) => {
        return self.expression(val, name);
      });
    },

    expression (val, name) {
      var self = this,
        ctx = _.extend({}, self.getData(), self.getParent(name), {
          self: self,
          root: self.rootData(),
          filename: self.getFilename(),
          dirname: self.getDirname(),
        });
      try {
        return _.expression(val, ctx);
      } catch(err) {
        return val;
      }
    },

  },

};