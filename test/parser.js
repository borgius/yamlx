'use strict';

const _ = require('lodash');

describe('commands', () => {

  it('interpolates', () => {
    x(d.url).to.be(`${d.domain}:${d.port}`);
    x(d.icons.manager.port).to.be(`icon-${d.port}`);
  });

});
