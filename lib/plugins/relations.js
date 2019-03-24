'use strict';

const _ = require('lodash');

module.exports = {

  methods: {

    fullPath(name) {
      if (!name) return this.fullName();
      var self = this,
        parentName = self.fullName(name);
      if (name.startsWith(parentName)) {
        name = name.slice(parentName.length);
      }
      return _
        .trim(`${parentName}.${name}`, '.')
        .replace(/\.+/mgi, '.');
    },

    fullName(name) {
      var self = this;
      return (name ? self.dataParent(name) : self)
        .dataParents(name, !name)
        .map(parent => parent.option('name'))
        .filter(name => !!name)
        .join('.');
    },

    fork(name) {
      var self = this,
        val = self.get(name);
      if (!name) {
        return new self.Data(self.getData(), _.extend(self.priv('opts'), {
          parent: self,
        }));
      }
      if (!val || typeof val !== 'object' || Array.isArray(val)) {
        return val;
      }
      let parent = self.dataParent(name);
      if (val instanceof self.Data) {
        val = val.getData();
      }
      return new self.Data(val, _.extend(parent.priv('opts'), {
        parent: self,
      }));
    },

    rootData() {
      var self = this,
        parent = self.option('parent');
      while (parent && parent.option('parent')) {
        parent = parent.option('parent');
      }
      return parent || self;
    },

    getParent(name) {
      var self = this;
      if (!name || !name.includes('.')) {
        return self;
      }
      return self.get(name.split('.').slice(0, -1).join('.'));
    },

    dataParents(name, includeSelf = false) {
      var self = this,
        parents = [],
        parent = self.dataParent(name);
      while (parent) {
        parents.unshift(parent);
        parent = parent.dataParent();
      }
      if (includeSelf) {
        parents.push(self);
      }
      return parents;
    },

    dataParent(name) {
      if (!name) return this.option('parent') || null;
      var self = this,
        chain = name.split('.'),
        parent = null;
      for (let i = chain.length - 1; i >= 0; i--) {
        let n = chain.slice(0, i + 1).join('.'),
          val = self.get(n);
        if (val instanceof self.Data) return val;
      }
      return self;
    },

  },

};
