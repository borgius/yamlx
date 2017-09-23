# xyaml
eXtended YAML loader

```js
const xyaml = require('xyaml');

var data = xyaml.loadFile(__dirname + '/settings.yaml');
```

## Commands

```yaml
port: 8080
domain: test.ru

# Interpolation
url: ${domain}:${port}
test: ${root.fullName()} ${filename} ${dirname}

# Include other files
icons: ~include(icons)
icons: ~include(https://pale.pro/s/assets/test/admin.yaml)
script: ~download(https://pale.pro/s/assets/test/admin.yaml)
```

## API

### Data

- Constructor
  - `new Date(data, opts = {})`
- Paths
  - `fullPath([name])`
  - `fullName([name])`
- Fork
  - `fork([name])`
- Parents
  - `rootData()`
  - `getParent([name])`
  - `dataParent([name])`
  - `dataParents([name], [includeSelf = false])`
- Data
  - `getData([name])`
  - `log([name])`
  - `toJSON([name])`
- Options
  - `getOptions()`
  - `option(name, val)`
  - `option(name)`
- Files
  - `getDirname()`
  - `getFilename()`
  - `resolve([path])`
- Properties
  - `def(name, value)`
  - `def(name)`
  - `def()`
  - `has(name)`
  - `keys()`
  - `del(name)`
  - `set(name, value)`
  - `get(name)`
- Private
  - `priv()`
  - `priv(name)`
  - `priv(name, value)`
  - `privHas(name)`
  - `privKeys()`
  - `privDel(name)`
- Eval
  - `expression(value)`
  - `interpolate(value)`
