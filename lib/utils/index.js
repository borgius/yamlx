const _ = require('lodash');

function type(val, skipClasses = false) {
  if (!skipClasses && val instanceof RegExp) return 'reg';
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'number' && isNaN(val)) return 'nan';
  if (isClass(val)) return 'class';
  return typeof val;
};

function isLikeArray(val) {
  if (!val || typeof val !== 'object') return false;
  if (Array.isArray(val)) return true;
  let keys = Object.keys(val);
  return Object.getOwnPropertyNames(val).includes('length') &&
    !!keys.filter(n => !isNaN(+n)).length;
};

function isClass(val) {
  return typeof val === 'function' &&
    Object.toString
    .call(val)
    .startsWith('class ');
};

function expression(code = '', globals = {}) {
  var args = _.keys(globals).map(k => k === '_' ? k : _.camelCase(k)),
    vals = _.values(globals);
  try {
    // console.log(args, `return ${code};`)
    return (new Function(...args, `return ${code};`))(...vals);
  } catch (err) {
    console.log(`${code}: ${err}`);
  }
};

function flattenArray(arr) {
  var items = [];
  Array.from(arr, item => {
    if (!item || typeof item !== 'object') {
      return items.push(item);
    }
    if (item.length !== undefined) {
      item = Array.from(item);
    }
    items = items.concat(flattenArray(item));
  });
  return items;
};

function flattenObject(obj, parentName = null, skipArrays = false, maxLevel = Infinity) {
  var data = {};
  if (Array.isArray(obj))
    return _.flattenArray(obj);
  if (!obj || typeof obj !== 'object')
    return obj;
  parentName = parentName || '';
  Object.keys(obj).forEach((name) => {
    var val = obj[name];
    name = parentName ? parentName + '.' + name : name;
    if (!val ||
      typeof val !== 'object' ||
      (skipArrays && Array.isArray(val)) ||
      name.split('.').length >= maxLevel) {
      data[name] = val;
      return;
    }
    Object.assign(data, flattenObject(val, name, skipArrays, maxLevel));
  });
  return data;
};


module.exports = {
  expression,
  type,
  isLikeArray,
  isClass,
  flattenObject,
  flattenArray,
}
