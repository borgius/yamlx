'use strict';

const _ = require('lodash');
const jsyaml = require('js-yaml');
const path = require('path');
const fs = require('./utils/fs');
const {
  flattenObject
} = require('./utils')
const Parser = require('./parser');
const util = require('util');
const maxProcessed = 3;

class Data {

  // Statics ===================================================================

  static loadFile(filename, opts = {}) {
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

  constructor(data, opts = {}) {
    var self = this;
    self.priv({
      opts,
    });
    self._extend(data);
  }

  get Data() {
    return Data;
  }

  // Implementation ============================================================

  _extend(data) {
    var self = this,
      flattenData = flattenObject(data, null, true),
      parsers = _
      .keys(flattenData)
      .map(name => new Parser(name, _.get(data, name), self));
    const plugins = Parser.getNames();
    const lastPlugin = _.last(plugins);
    for (const key in parsers) {
      let parser = parsers[key];
      while (!parser.done && parser.processed < maxProcessed) {
        for (var plugin of plugins) {
          parser.parseName(plugin);
          if (parser.val === undefined) {
            parser.processed++;
            parser.val = parser.prevVal;
            parsers.splice(key, 1);
            parsers.push(parser);
            parser = parsers[key];
            break;
          } else {
            _.set(self, parser.fullName, parser.val);
          }
          if (parser.prevVal !== parser.val) {
            parser.prevVal = parser.val;
            parser.processed++;
            break;
          }
        }
        parser.done = plugin === lastPlugin;
      }
    }
    return self;
  }

}

module.exports = Data;
