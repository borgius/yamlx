'use strict';

const _ = require('lodash');

module.exports = {
  names: ['delete', 'merge'],

  commands: {

    delete(name, val, type) {
      var self = this;
      if (type !== 'command' || !['del', 'delete'].includes(val.command))
        return self;
      [name, ...val.args].map(key => {
        self.data.del.call(self.data, self.data.findProp.call(self.data, self.fullName, key));
      });
      self.done = true;
    },

    merge(name, val, type) {
      var self = this;
      if (type !== 'command' || !['merge', 'mergeDiscard', 'mergeAppend'].includes(val.command))
        return self;
      return self.data.merge.call(self.data, self.fullName, val.args, val.command);
    }

  },

  methods: {

    // Props =====================================================================
    merge(prop, sources, strategy = 'mergeOverwrite') {
      var self = this;
      self.del(prop);
      const parentName = self.getParentName(prop);
      const parent = self.getData(self.getParentName(prop));
      const customizer = (objValue, srcValue, key, object, source) => {
        switch (strategy) {
          case 'mergeDiscard':
            if (_.isNumber(objValue) || _.isString(objValue)) {
              return objValue;
            }
            break;
          case 'mergeAppend':
            if (_.isArray(objValue)) {
              return objValue.concat(srcValue);
            };
            break;
          case 'mergeOverwrite':
          default:
            return undefined;
            break;
        }
      };
      sources.map(source => self.findProp(prop, source))
        .filter(_.isString)
        .map(source => _.cloneDeep(self.getData(source)))
        .map(source => _.mergeWith(parent, source, customizer));
      self.set(parentName, parent);
    },

    keys() {
      var self = this;
      return _.keys(self);
    },

    has(name) {
      var self = this;
      return _.get(self, name) !== undefined;
    },

    findProp(base, name) {
      var self = this;
      let _base = (base || '').split('.');
      let _name = (name || '').split('.');
      if (_name[0] === 'self') {
        _name.splice(0, 1);
      }
      if (_name[0] === 'root') {
        _name.splice(0, 1);
        _base = [];
      }
      do {
        const res = [..._base, ..._name].join('.');
        if (self.has(res)) return res
      } while (_base.pop());
    },

    getParentName(name) {
      let chain = name.split('.'),
        lastName = chain.pop();
      return chain.join('.');
    },

    getParentData(name) {
      var self = this;
      return self.getData(self.getParentName(name));
    },

    del(name) {
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
      if (!parent ||
        typeof parent !== 'object' ||
        Array.isArray(parent) ||
        !parent.hasOwnProperty(lastName)) {
        return self;
      }
      delete parent[lastName];
      return self;
    },

    def(name, val) {
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

    set(name, val) {
      var self = this;
      return self.def(name, val);
    },

    get(name) {
      var self = this;
      if (typeof name !== 'string') return self;
      return self.def(name);
    },

    // Private ===================================================================

    priv(name, val) {
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

    privDel(name) {
      var self = this;
      return self.del(`_${name}`);
    },

    privKeys(name) {
      var self = this;
      return Object
        .getOwnPropertyNames(self)
        .filter(name => name.startsWith('_'))
        .map(name => name.slice(1));
    },

    privHas(name) {
      var self = this;
      return self
        .privKeys()
        .includes(name);
    },

  },

};
