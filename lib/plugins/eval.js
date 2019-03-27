'use strict';
const _ = require('lodash');
const {
  expression
} = require('../utils');


function parents(base, name) {
  let path = base.split('.');
  let res = []
  while (path.pop()) {
    res.push([...path, name].join('.'));
  }
  return res;
}

module.exports = {

  names: ['interpolate', 'commands'],

  commands: {

    interpolate(name, val, type) {
      var self = this;
      if (type !== 'string') return self;
      return self.data.interpolate(val, self.fullName);
    },

    commands(name, val, type) {
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

    interpolate(val, name) {
      var self = this;
      if (typeof val === 'string') {
        if (val.startsWith('${') && val.endsWith('}') && val.split('${').length === 2) {
          return self.expression(val.slice(2, -1), name);
        }
        return val.replace(/\$\{(.+?)\}/mgi, (txt, val) => {
          return self.expression(val, name);
        });
      } else return val;
    },

    expression(val, name) {
      var self = this,
        ctx = _.extend({}, self.getData(), self.getParent(name), {
          _: _,
          _name: name,
          self: self,
          root: self.rootData(),
          filename: self.getFilename(),
          dirname: self.getDirname(),
        });
      let res;
      try {
        if (/^[\.\w]+$/.test(val)) {
          const prop = self.findProp(name, val);
          if (prop !== undefined) res = self.get(prop);
        }
        if (res === undefined) res = expression(val, ctx);
      } catch (err) {
        // console.log(err);
      }
      return res;
    },

  },

};
