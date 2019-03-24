'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const Data = require('./data');
const Parser = require('./parser');

class YamlX {

  loadFile (file, opts = {}) {
    var self = this,
      filename = file.startsWith('http')
        ? file
        : path.resolve(process.cwd(), file),
      indexFilename = path.resolve(filename, 'index.yaml');
    if (fs.existsSync(indexFilename)) {
      filename = indexFilename;
    }
    return Data.loadFile(filename, opts);
  }

  plugin (data) {
    var self = this;
    Parser.plugin(data);
  }

}

module.exports = YamlX;
