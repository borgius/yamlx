'use strict';

const _ = require('lodash');
const jsyaml = require('js-yaml');
const path = require('path');
const fs = require('./utils/fs');
const {
  flattenObject,
  maxProcessed,
} = require('./utils');
const Parser = require('./parser');
const util = require('util');
let parsers = [];

class Data {

  // Statics ===================================================================

  static loadFile(filename, opts = {}) {
    const source = fs.read(filename),
      data = jsyaml.load(source, {
        schema: jsyaml.DEFAULT_FULL_SCHEMA,
        json: true,
      }),
      item = new Data(data, _.extend(opts, {
        filename,
      }));
    return item;
  }

  // Constructor ===============================================================

  constructor(data, opts = {}) {
    this.priv({
      opts,
    });
    this._extend(data);
  }

  get Data() {
    return Data;
  }

  // Implementation ============================================================
  addFile(filename, parent = null) {
    const data = jsyaml.load(fs.read(filename), {
      schema: jsyaml.DEFAULT_FULL_SCHEMA,
      json: true,
    });
    return this.addParsers(data, parent);
  }

  addParsers(data, parent = null) {
    const newParsers = this.createParsers(data, parent);
    parsers.push(...newParsers);
    return data;
  }

  createParsers(data, parent = '') {
    const repl = parent ? new RegExp(`^${parent}\\.`) : '';
    const parsers = _
      .keys(flattenObject(data, parent, true))
      .map(name => new Parser(name, _.get(data, name.replace(repl, '')), this));
    return parsers;
  }

  _extend(data) {
    parsers = this.createParsers(data);
    const plugins = Parser.getNames();
    const lastPlugin = _.last(plugins);
    let key = 0;
    while (key < parsers.length) {
      let parser = parsers[key];
      while (!parser.done && parser.processed <= maxProcessed) {
        for (var plugin of plugins) {
          parser.parseName(plugin);
          if (parser.val === undefined) {
            // move current parser to the end and get next one
            parser.processed++;
            parser.val = parser.prevVal;
            parsers.splice(key, 1);
            parsers.push(parser);
            parser = parsers[key];
            break;
          } else {
            _.set(this, parser.fullName, parser.val);
          }
          if (parser.prevVal !== parser.val) {
            parser.prevVal = parser.val;
            parser.processed++;
            break;
          }
        }
        parser.done = parser.done || plugin === lastPlugin;
      }
      key++;
    }
    return this;
  }

}

module.exports = Data;
