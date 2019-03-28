'use strict';

const _ = require('lodash');
const {
  maxProcessed,
} = require('../utils/const');


module.exports = {
  names: ['delete', 'merge'],

  commands: {

    delete(name, val, type) {
      if (type !== 'command' || !['del', 'delete'].includes(val.command))
        return this;
      [name, ...val.args].map(key => {
        this.data.del.call(this.data, this.data.findProp.call(this.data, this.fullName, key));
      });
      this.done = true;
    },

    merge(name, val, type) {
      if (type !== 'command' || !['merge', 'mergeDiscard', 'mergeAppend'].includes(val.command))
        return this;
      this.data.merge.call(this.data, this.fullName, val.args, val.command);
      this.done = true;
    }

  },

  methods: {

    // Props =====================================================================
    merge(prop, sources, strategy = 'mergeOverwrite') {
      this.del(prop);
      const parentName = this.getParentName(prop);
      const parent = this.getData(parentName);
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
      sources.map(source => this.findProp(prop, source))
        .filter(_.isString)
        .map(source => _.cloneDeep(this.getData(source)))
        .map(data => this.addParsers(data, parentName))
        .map(data => _.mergeWith(parent, data, customizer));
      this.set(parentName, parent);
    },

    keys() {
      return _.keys(this);
    },

    has(name) {
      return _.get(this, name) !== undefined;
    },

    findProp(base, name) {
      let _base = (base || '').split('.');
      let _name = (name || '').split('.');
      if (_name[0] === 'this') {
        _name.splice(0, 1);
      }
      if (_name[0] === 'root') {
        _name.splice(0, 1);
        _base = [];
      }
      do {
        const res = [..._base, ..._name].filter(Boolean).join('.');
        if (this.has(res)) return res
      } while (_base.pop());
    },

    getParentsName(name) {
      let chain = name.split('.');
      let parents = [];
      while (chain.pop() && chain.length > 0) parents.push(chain.join('.'));
      return parents;
    },

    getParentName(name) {
      let chain = name.split('.');
      let lastName = chain.pop();
      return chain.join('.');
    },

    getParentData(name) {
      return this.getData(this.getParentName(name));
    },

    del(name) {
      if (!this.has(name)) {
        return this;
      }
      if (!name.includes('.')) {
        delete this[name];
        return this;
      }
      let chain = name.split('.'),
        lastName = chain.pop(),
        parentName = chain.join('.'),
        parent = _.get(this, parentName);
      if (!parent ||
        typeof parent !== 'object' ||
        Array.isArray(parent) ||
        !parent.hasOwnProperty(lastName)) {
        return this;
      }
      delete parent[lastName];
      return this;
    },

    def(name, val) {
      if (arguments.length === 1 && typeof name === 'object') {
        _.each(name, (val, name) => {
          this.set(name, val);
        });
        return this;
      }
      if (arguments.length === 1 && typeof name === 'string') {
        if (name === 'root') return this;
        return _.get(this, name);
      }
      _.set(this, name, val);
      return this;
    },

    set(name, val) {
      return this.def(name, val);
    },

    get(name) {
      if (typeof name !== 'string') return this;
      return this.def(name);
    },

    // Private ===================================================================

    priv(name, val) {
      if (arguments.length === 1 && typeof name === 'object') {
        _.each(name, (val, name) => {
          this.priv(name, val);
        });
        return this;
      }
      if (arguments.length === 1 && typeof name === 'string') {
        return this[`_${name}`];
      }
      if (this.hasOwnProperty(`_${name}`)) {
        this[`_${name}`] = val;
        return this;
      }
      Object.defineProperty(this, `_${name}`, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val,
      });
      return this;
    },

    privDel(name) {
      return this.del(`_${name}`);
    },

    privKeys(name) {
      return Object
        .getOwnPropertyNames(this)
        .filter(name => name.startsWith('_'))
        .map(name => name.slice(1));
    },

    privHas(name) {
      return this
        .privKeys()
        .includes(name);
    },

  },

};
