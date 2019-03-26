module.exports = {

  names: ['num', 'str', 'bool', 'ex'],

  commands: {

    ex(name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'ex')
        return self;
      return self.data.expression(val.val, self.fullName);
    },

    str(name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'str')
        return self;
      return val.val + '';
    },

    num(name, val, type) {
      var self = this;
      if (type !== 'command' || val.command !== 'num')
        return self;
      return +val.val;
    },
    bool(name, val, type) {
      var self = this;
      if (type !== 'command' || !['bool', 'boolean', 'isTrue'].includes(val.command))
        return self;
      return !!val.val;
    },

  },

};
