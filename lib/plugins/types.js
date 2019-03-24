module.exports = {

  names: ['num', 'str', 'ex'],

  commands: {

    ex (name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'ex')
        return self;
      return self.data.expression(val.val, self.fullName);
    },

    str (name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'str')
        return self;
      return val.val + '';
    },

    num (name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'num')
        return self;
      return +val.val;
    },

  },

};
