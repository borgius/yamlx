'use strict';

const _ = require('plp/rextend')(require('lodash'), [
  'flatten',
  'aliases',
  'trim',
]);
const jsyaml = require('js-yaml');
const path = require('path');
const fs = require('kit/fs');
const Parser = require('./parser');
const util = require('util');

class Data {

  // Statics ===================================================================

  static loadFile (filename, opts = {}) {
    var source = fs.read(filename),
      data = jsyaml.load(source, {
        schema: jsyaml.DEFAULT_FULL_SCHEMA,
      }),
      item = new Data(data, _.extend(opts, {
        filename,
      }));
    return item;
  }

  // Constructor ===============================================================

  constructor (data, opts = {}) {
    var self = this;
    _.aliases(self, {
      getOptions: ['option', 'options'],
    });
    self.priv({
      opts,
    });
    self._extend(data);
  }

  // Paths =====================================================================

  fullPath (name) {
    if (!name) return this.fullName();
    var self = this,
      parentName = self.fullName(name);
    if (name.startsWith(parentName)) {
      name = name.slice(parentName.length);
    }
    return _
      .trim(`${parentName}.${name}`, '.')
      .replace(/\.+/mgi, '.');
  }

  fullName (name) {
    var self = this;
    return (name ? self.dataParent(name) : self)
      .dataParents(name, !name)
      .map(parent => parent.option('name'))
      .filter(name => !!name)
      .join('.');
  }

  // Children ==================================================================

  fork (name) {
    var self = this,
      val = self.get(name);
    if (!name) {
      return new Data(self.getData(), _.extend(self.priv('opts'), {
        parent: self,
      }));
    }
    if (!val || typeof val !== 'object' || Array.isArray(val)) {
      return val;
    }
    let parent = self.dataParent(name);
    if (val instanceof Data) {
      val = val.getData();
    }
    return new Data(val, _.extend(parent.priv('opts'), {
      parent: self,
    }));
  }

  // Parents ===================================================================

  rootData () {
    var self = this,
      parent = self.option('parent');
    while (parent && parent.option('parent')) {
      parent = parent.option('parent');
    }
    return parent || self;
  }

  getParent (name) {
    var self = this;
    if (!name) {
      return self;
    }
    return self.get(name.split('.').slice(0, -1).join('.'));
  }

  dataParents (name, includeSelf = false) {
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
  }

  dataParent (name) {
    if (!name) return this.option('parent') || null;
    var self = this,
      chain = name.split('.'),
      parent = null;
    for (let i = chain.length - 1; i >= 0; i--) {
      let n = chain.slice(0, i + 1).join('.'),
        val = self.get(n);
      if (val instanceof Data) return val;
    }
    return self;
  }

  // Dump/Restore ==============================================================

  log (name, depth = Infinity) {
    var self = this;
    console.log(util.inspect(self.getData(name), {
      colors: true,
      depth: depth,
    }));
  }

  toJSON (name, pretty = false) {
    var self = this;
    return pretty
      ? JSON.stringify(self.getData(name), null, 2)
      : JSON.stringify(self.getData(name));
  }

  getData (name) {
    var self = this,
      data = {};
    _.each(self.get(name), (val, name) => {
      if (val instanceof Data) {
        val = val.getData();
      }
      data[name] = val;
    });
    return data;
  }

  // Options ===================================================================

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
  }

  // Files =====================================================================

  getDirname () {
    var self = this;
    return path.dirname(self.getFilename());
  }

  getFilename () {
    var self = this;
    return self.option('filename');
  }

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
  }

  // Props =====================================================================

  keys () {
    var self = this;
    return _.keys(self);
  }

  has (name) {
    var self = this;
    return _.get(self, name) !== undefined;
  }

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
  }

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
  }

  set (name, val) {
    var self = this;
    return self.def(name, val);
  }

  get (name) {
    var self = this;
    if (typeof name !== 'string') return self;
    return self.def(name);
  }

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
  }

  privDel (name) {
    var self = this;
    return self.del(`_${name}`);
  }

  privKeys (name) {
    var self = this;
    return Object
      .getOwnPropertyNames(self)
      .filter(name => name.startsWith('_'))
      .map(name => name.slice(1));
  }

  privHas (name) {
    var self = this;
    return self
      .privKeys()
      .includes(name);
  }

  // Eval ======================================================================

  interpolate (val) {
    var self = this;
    return val.replace(/\$\{(.+?)\}/mgi, (txt, name) => {
      return self.expression(name);
    });
  }

  expression (val) {
    var self = this,
      ctx = _.extend(self.getData(), {
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
  }

  // Implementation ============================================================

  _extend (data) {
    var self = this,
      flattenData = _.flatten(data, null, true),
      parsers = _
        .keys(flattenData)
        .map(name => new Parser(name, _.get(data, name), self));
    _.each(Parser.getNames(), name => {
      _.each(parsers, parser => {
        parser.parseName(name);
        _.set(self, parser.fullName, parser.val);
      });
    });
    return self;
  }

}

module.exports = Data;
