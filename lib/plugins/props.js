'use strict';

const _ = require('lodash');

module.exports = {

  methods: {

    // Props =====================================================================

    keys () {
      var self = this;
      return _.keys(self);
    },

    has (name) {
      var self = this;
      return _.get(self, name) !== undefined;
    },

    del (name) {
      var self = this;
      if (!self.has(name)) {
        return self;
      }
      if (!name.includes('.')) {
        delete self[name];
        return self;
      }
      let chain = name.split('.'),
        lastName = chain.pop(),
        parentName = chain.join('.'),
        parent = _.get(self, parentName);
      if (!parent
          || typeof parent !== 'object'
          || Array.isArray(parent)
          || !parent.hasOwnProperty(lastName)) {
        return self;
      }
      delete parent[lastName];
      return self;
    },

    def (name, val) {
      var self = this;
      if (arguments.length === 1 && typeof name === 'object') {
        _.each(name, (val, name) => {
          self.set(name, val);
        });
        return self;
      }
      if (arguments.length === 1 && typeof name === 'string') {
        return _.get(self, name);
      }
      _.set(self, name, val);
      return self;
    },

    set (name, val) {
      var self = this;
      return self.def(name, val);
    },

    get (name) {
      var self = this;
      if (typeof name !== 'string') return self;
      return self.def(name);
    },

    // Private ===================================================================

    priv (name, val) {
      var self = this;
      if (arguments.length === 1 && typeof name === 'object') {
        _.each(name, (val, name) => {
          self.priv(name, val);
        });
        return self;
      }
      if (arguments.length === 1 && typeof name === 'string') {
        return self[`_${name}`];
      }
      if (self.hasOwnProperty(`_${name}`)) {
        self[`_${name}`] = val;
        return self;
      }
      Object.defineProperty(self, `_${name}`, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val,
      });
      return self;
    },

    privDel (name) {
      var self = this;
      return self.del(`_${name}`);
    },

    privKeys (name) {
      var self = this;
      return Object
        .getOwnPropertyNames(self)
        .filter(name => name.startsWith('_'))
        .map(name => name.slice(1));
    },

    privHas (name) {
      var self = this;
      return self
        .privKeys()
        .includes(name);
    },

  },

};
