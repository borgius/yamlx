'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const Data = require('./data');

class Xyaml {

  loadFile (file, opts = {}) {
    var self = this,
      filename = file.startsWith('http')
        ? file
        : path.resolve(process.cwd(), file);
    return Data.loadFile(filename, opts);
  }

}

module.exports = Xyaml;
