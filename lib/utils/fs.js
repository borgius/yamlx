'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const request = require('sync-request');

class FS {

  readFiles(data = {}, basedir = process.cwd(), outdir = process.cwd()) {
    var self = this,
      files = {};
    _.each(data, (file, name) => {
      var filename = path.resolve(basedir, file),
        output = path.resolve(outdir, file),
        source = self.read(filename);
      files[name] = {
        name: name,
        file: file,
        filename: filename,
        output: output,
        source: source,
      };
    });
    return files;
  }

  resolveFiles(data = {}, basedir = process.cwd()) {
    var self = this,
      files = {};
    _.each(data, (file, name) => {
      files[name] = path.resolve(basedir, file);
    });
    return files;
  }

  spawn(cmd, args = [], opts = {}) {
    var self = this;
    if (arguments.length === 2 && typeof args === 'string') {
      opts = args;
      args = [];
    }
    if (typeof opts === 'string') {
      opts = {
        cwd: opts,
      };
    }
    if (typeof args === 'string') {
      args = args.split(' ');
    }
    if (arguments.length === 2 && typeof args === 'object' && !Array.isArray(args)) {
      opts = args;
      args = [];
    }
    if (cmd.indexOf(' ') > -1) {
      args = args.concat(cmd.split(' ').slice(1));
      cmd = cmd.split(' ')[0];
    }
    return new Promise((resolve, reject) => {
      var options = _.extend({}, opts),
        stream = childProcess.spawn(cmd, args, options),
        content = '';
      stream.stdout.on('data', (data) => {
        content += data;
        if (opts.out) console.log(data);
      });
      stream.stderr.on('data', (data) => {
        if (opts.out) console.error(data);
      });
      stream.on('error', reject);
      stream.on('close', code => resolve(content));
    });
  }

  mkdir(dirname) {
    var self = this;
    if (self.exists(dirname)) return;
    return fs.mkdirSync(dirname);
  }

  exists(filename) {
    var self = this;
    return fs.existsSync(filename);
  }

  write(filename, content) {
    var self = this;
    fs.writeFileSync(filename, content);
  }

  read(filename, encoding = 'utf-8') {
    var self = this;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return self.download(filename);
    }
    return fs.readFileSync(filename, encoding);
  }

  list(dirname, isFull = false) {
    var self = this,
      files = fs.readdirSync(dirname);
    if (isFull) {
      files = files.map(name => path.resolve(dirname, name));
    }
    return files;
  }

  writeFiles(data, opts = {}) {
    var self = this;
    _.each(data, (content, filename) => {
      if (opts.basedir)
        filename = path.resolve(opts.basedir, filename);
      self.write(filename, content);
    });
  }

  same(file1, file2) {
    var self = this;
    return self.read(file1) === self.read(file2);
  }

  download(url, opts = {}) {
    var self = this,
      res = request('GET', url);
    return opts.bin ? res.getBody() : res.getBody() + '';
  }

}

module.exports = new FS();
