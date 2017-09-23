'use strict';

const _ = require('plp/rextend')(require('lodash'), [
  'class-meta',
  'type',
  'expression',
]);

const PLUGINS = [];

class Parser extends getBaseParser() {

  static get names() {
    return [
        'interpolate',
        'command',
      ].concat(
        _.flatten(PLUGINS.map(plugin => plugin.names))
      )
      .concat(
        [
          'array'
        ]
      );
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
    }

    static plugin (plugin) {
      var self = this;
      PLUGINS.push(plugin);
      _.each(plugin.names, name => {
        Parser.prototype[name] = plugin[name];
      });
      return self;
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
