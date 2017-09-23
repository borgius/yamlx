'use strict';

const _ = require('plp/rextend')(require('lodash'), [
  'class-meta',
  'type',
  'expression',
]);
const path = require('path');
const jsyaml = require('js-yaml');
const fs = require('kit/fs');

class Parser extends getBaseParser() {

  static get names() {
    return [
      'interpolate',
      'command',
      'download',
      'include',
      'str',
      'num',
      'array',
    ];
  }

  // Commands ==================================================================

  str (name, val, type) {
    var self = this;
    if (type !== 'command' || val.command !== 'str')
      return self;
    return val.val + '';
  }

  num (name, val, type) {
    var self = this;
    if (type !== 'command' || val.command !== 'num')
      return self;
    return +val.val;
  }

  download (name, val, type) {
    var self = this;
    if (type !== 'command' || val.command !== 'download')
      return self;
    return fs.download(val.val);
  }

  include (name, val, type) {
    var self = this;
    if (type !== 'command' || !['include', 'import', 'read'].includes(val.command))
      return self;
    let filename = val.args[0].startsWith('http')
      ? val.args[0]
      : self.data.resolve(val.args[0]),
      ext = path.extname(filename);
    if (!fs.exists(filename) && !filename.startsWith('http'))
      return '';
    if (['.yaml', '.xyaml', '.cml'].includes(ext)) {
      let data = self.Data.loadFile(filename, {
        name,
        parent: self.data,
      });
      return data;
    }
    if (ext === '.js') {
      try {
        return require(filename);
      } catch(err) {
        return fs.readFileSync(filename, 'utf-8');
      }
    }
    if (ext === '.json') {
      try {
        return jsyaml.safeLoad(fs.readFileSync(filename, 'utf-8'));
      } catch(err) {
        return fs.readFileSync(filename, 'utf-8');
      }
    }
    return fs.readFileSync(filename, 'utf-8');
  }

  // Secondary =================================================================

  array (name, vals, type) {
    var self = this;
    if (type !== 'array') return self;
    let parsers = vals.map(val => new Parser(name, val, self.data)),
      results = [];
    _.each(Parser.getNames(), name => {
      _.each(parsers, (parser, i) => {
        parser.parseName(name);
        results[i] = parser.val;
      });
    });
    return results;
  }

  // Primary ===================================================================

  command (name, val, type) {
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
  }

  interpolate (name, val, type) {
    var self = this;
    if (type !== 'string') return self;
    return self.data.interpolate(val, self.fullName);
  }

}

module.exports = Parser;

function getBaseParser() {

  return class BaseParser {

    static getNames() {
      var self = this;
      return self.names;
      return _.classMeta
        .methodsNames(self, ['parse', 'parseName', 'getNames'])
        .sort();
    }

    constructor (fullName, val, data) {
      var self = this;
      self.fullName = fullName;
      self.name = fullName.split('.').pop();
      self.original = val;
      self.val = val;
      self.data = data;
      self.type = _.type(val);
    }

    get Data () {
      var self = this;
      return require('./data');
    }

    parseName (name) {
      var self = this,
        method = self[name].bind(self),
        result = method(self.name, self.val, self.type);
      if (result === self) {
        return self;
      }
      self.val = result;
      return self;
    }

  };

}
