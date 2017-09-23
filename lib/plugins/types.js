module.exports = {

  names: ['num', 'str'],

  commands: {

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
