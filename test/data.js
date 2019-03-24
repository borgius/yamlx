'use strict';

const path = require('path');

describe('data', () => {

  it('handles arrays', () => {
    x(d.items).to.eql(['test1', 'test2', 'test3']);
  });

  it('handles filenames', () => {
    x(d.getFilename()).to.be(path.resolve(__dirname, 'data/config.yaml'));
    x(d.getDirname()).to.be(path.resolve(__dirname, 'data'));
    x(d.port).to.be(8080);
    x(d.resolve('icons')).to.be(path.resolve(__dirname, 'data/icons.yaml'));
  });

  it('works with options', () => {
    x(d.option()).to.eql(d._opts);
    x(d.option('filename')).to.be(d.getFilename());
  });

  it('handles vars', () => {
    x(d.def('x.y.z')).to.be(undefined);
    x(d.def('x.y.z', 55)).to.be(d);
    x(d.def('x.y.z')).to.be(55);
    x(d.x.y.z).to.be(55);
    x(d.del('x.y.z')).to.be(d);
    x(d.x.y.z).to.be(undefined);
    x(d.del('x')).to.be(d);
  });

  it('handles private vars', () => {
    x(d.priv('test')).to.be(undefined);
    x(d.priv('test', 123)).to.be(d);
    x(d.test).to.be(undefined);
    x(d._test).to.be(123);
    x(d.priv('test')).to.be(123);
    x(d.priv('test', 456)).to.be(d);
    x(d.priv('test')).to.be(456);
    x(d.privHas('test')).to.be(true);
    x(d.privDel('test')).to.be(d);
    x(d.privHas('test')).to.be(false);
  });

  it('returns keys', () => {
    x(d.keys()).to.contain('port');
    x(d.keys()).to.contain('icons');
  });

  it('forks', () => {
    var f = d.fork('icons.manager');
    x(f.getData()).to.eql(d.getData('icons.manager'));
    x(f.getFilename()).to.be(path.resolve(__dirname, 'data/icons.yaml'));
  });

  it('returns parent', () => {
    x(d.getParent('icons.manager.plus')).to.be(d.icons.manager);
    x(d.getParent()).to.be(d);
  });

  it('works with data parents', () => {
    x(d.dataParent()).to.be(null);
    x(d.icons.dataParent()).to.be(d);
    x(d.icons.admin.dataParent()).to.be(d.icons);

    x(d.dataParents()).to.eql([]);
    x(d.icons.dataParents()).to.eql([d]);
    x(d.icons.admin.dataParents()).to.eql([d, d.icons]);

    x(d.rootData()).to.be(d);
    x(d.icons.rootData()).to.be(d);
    x(d.icons.admin.rootData()).to.be(d);
  });

  it('works with json', () => {
    x(d.toJSON()).to.be(JSON.stringify(d.getData()));
    x(d.toJSON(null, true)).to.be(JSON.stringify(d.getData(), null, 2));
  });

  it('works with paths', () => {
    x(d.fullName()).to.be('');
    x(d.icons.admin.fullName()).to.be('icons.admin');

    x(d.fullPath()).to.be('');
    x(d.fullPath('icons.manager.plus')).to.be('icons.manager.plus');
    x(d.icons.fullPath('manager.plus')).to.be('icons.manager.plus');
    x(d.icons.admin.fullPath('ui.plus')).to.be('icons.admin.ui.plus');
  });

  it('works with expressions', () => {
    x(d.expression('self.domain')).to.be(d.domain);
    x(d.interpolate('EXPR: ${self.domain}=${port}')).to.be(`EXPR: ${d.domain}=${d.port}`);
  });

});
