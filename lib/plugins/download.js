'use strict';

const _ = require('lodash');
const fs = require('kit/fs');

module.exports = {

  names: ['download'],

  commands: {

    download (name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'download')
        return self;
      return fs.download(val.val);
    },
    
  },

};
