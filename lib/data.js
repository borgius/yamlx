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
    self.priv({
      opts,
    });
    self._extend(data);
  }

  get Data () {
    return Data;
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
