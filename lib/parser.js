'use strict';

const _ = require('lodash');
const {
  type
} = require('./utils');

const PLUGINS = [];

class Parser extends getBaseParser() {

  static get names() {
    return [

      ].concat(
        _.flatten(PLUGINS.map(plugin => plugin.names || []))
      )
      .concat(
        [
          'array'
        ]
      );
  }

  // Secondary =================================================================

  array(name, vals, type) {
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

}

module.exports = Parser;

function getBaseParser() {

  return class BaseParser {

    static getNames() {
      var self = this;
      return self.names;
    }

    static plugin(plugin) {
      var self = this;
      PLUGINS.push(plugin);
      _.each(plugin.names, name => {
        Parser.prototype[name] = plugin.commands[name];
      });
      _.each(plugin.methods, (method, name) => {
        self.Data.prototype[name] = method;
      });
      return self;
    }

    static get Data() {
      return require('./data');
    }

    constructor(fullName, val, data) {
      var self = this;
      self.fullName = fullName;
      self.name = fullName.split('.').pop();
      self.original = val;
      self.prevVal = val;
      self.val = val;
      self.data = data;
      self.type = type(val);
      self.processed = 0;
      self.done = false;
    }

    get Data() {
      var self = this;
      return self.constructor.Data;
    }

    parseName(name) {
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
