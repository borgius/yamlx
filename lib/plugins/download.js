'use strict';

const _ = require('lodash');

module.exports = {

  names: ['download'],

  commands: {

    download(name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'download')
        return self;
      return val.val; // fs.download(val.val);
    },

  },

};
