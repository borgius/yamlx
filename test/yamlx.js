'use strict';

describe('yamlx', () => {

  it('loads data from filename', () => {
    var data = yamlx.loadFile('test/data/icons.yaml');
    x(data.manager.plus).to.be('icon-plus')
  });

});
