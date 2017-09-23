'use strict';

const util = require('util');
const _ = require('lodash');

module.exports = {

  methods: {

    log (name, depth = Infinity) {
      var self = this;
      console.log(util.inspect(self.getData(name), {
        colors: true,
        depth: depth,
      }));
    },

    toJSON (name, pretty = false) {
      var self = this;
      return pretty
        ? JSON.stringify(self.getData(name), null, 2)
        : JSON.stringify(self.getData(name));
    },

    getData (name) {
      var self = this,
        data = {};
      _.each(self.get(name), (val, name) => {
        if (val instanceof self.Data) {
          val = val.getData();
        }
        data[name] = val;
      });
      return data;
    },

  },

};
