'use strict';

const _ = require('lodash');

describe('plugins', () => {

  it('works with types', () => {
    x(_.values(d.icons.manager.ui.angle)).to.eql([1, 2, 3, 4]);
    x(d.icons.manager.ui.angle.left).to.be.a('string');
  });

  it('includes files', () => {
    x(d.icons.manager.plus).to.be('icon-plus');
    x(d.test1).to.be(`TEST\n`);
    x(d.test2).to.eql({ test2: true });
    x(d.icons.admin.test.test1).to.be(true);
  });

  it('downloads', () => {
    x(d.test3).to.be('ui:\n  plus: admin-plus\ntest: ~include(test.yaml)\n');
  });

});
