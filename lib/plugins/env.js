// const path = require('path');
const trimQuotes = (str) => {
  let res = str.replace(/^"(.+(?="$))"$/, '$1');
  if (res === str) res = str.replace(/^'(.+(?='$))'$/, '$1');
  return res;
};

module.exports = {

  names: ['env'],

  commands: {

    env(name, val, type) {
      const self = this;
      if (!val || type !== 'command' || !['env'].includes(val.command)) {
        return self;
      }
      const [envName, def = ''] = val.args;
      return process.env[trimQuotes(envName)] || trimQuotes(def);
    },

  },
};
