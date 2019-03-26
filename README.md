# yamlx

YAML loader (eXtended)

> forked from https://github.com/teniryte/xyaml

```js
const yamlx = require('yamlx');

var data = yamlx.loadFile(__dirname + '/pipeline.yaml');
```

## YAML File Example

```yaml
env: ~env(HOME)
name: test
port: 8080
domain: ${name}.com
portStr: ~str(${self.port})
portNum: ~num(${self.portStr})
hasPort: ~bool(${portNum})
url: ${domain}:${port}
level1:
  port: 3000
  port1: ${port+10}
  port2: ${root.port+10}
  portRange: ${port1-10}..${port2+10}
  -export: ~export(root, export.yaml)
  level2:
    level3: test
    -merge: ~merge(items)

icons: ~import(icons)
test1: ~read(${name}1.txt)
test2: ~include(test2.json)
test3: ~read(admin.yaml)

items:
  - ${name}1
  - ${name}2
  - ${name}3
```

## Yaml Commands

- \${exp} - run expression. Available all keys from current level (`self`) and all parents levels + `root`
- ~str(exp) - convert to string
- ~num(exp) - convert to number
- ~bool(exp) - convert to boolean
- ~env(varName, default) - fetch Environment variable or use default value
- ~merge(source1, source2, ...) - deep merge all sources to current level (key with merge command will be removed)
- ~mergeOverwrite(source1, source2, ...) - alias for ~merge
- ~mergeDiscard(source1, source2, ...) - same as merge, but NOT override exists keys
- ~mergeAppend(source1, source2, ...) - same as merge, but also concat arrays
- ~del(key1, key2, ...) - remove specified keys
- ~include(filename) - read yaml/json file in include as object
- ~read(filename) - read and insert file as string
- ~export(key, filename.yaml) - export specified key as YAML or JSON

## API

### yamlx

```js
yamlx.loadFile(filename, [opts]);
```

### Data

#### Constructor

```js
var data = new Data(data, (opts = {}));
```

#### Methods

- Paths:
  - `fullPath([name])`: Get full pathname.
  - `fullName([name])`: Get full data's name.
- Fork:
  - `fork([name])`: Fork data object.
- Parents:
  - `rootData()`: Get root data object.
  - `getParent([name])`: Get path's parent object.
  - `dataParent([name])`: Get path's data parent object.
  - `dataParents([name], [includeSelf = false])`: Get path's data parent objects array.
- Data:
  - `getData([name])`: Get plain javascript-object.
  - `log([name])`: Log plain object data to console.
  - `toJSON([name])`: Get JSON-serialized string.
- Options:
  - `options()`: Get full options object.
  - `option(name)`: Get option value.
  - `option(name, val)`: Set option value.
- Files:
  - `getDirname()`: Get data's directory name.
  - `getFilename()`: Get data's file name.
  - `resolve([path])`: Resolve path relative to data's directory name.
- Properties:
  - `def()`: Get data's properties object.
  - `def(name)`: Get property.
  - `def(name, value)`: Set property.
  - `has(name)`: `true` if data has property `name`.
  - `keys()`: Get data's properties names array.
  - `del(name)`: Delete property `name`.
  - `set(name, value)`: Set property.
  - `get(name)`: Get property.
- Private:
  - `priv()`: Get data's private properties object.
  - `priv(name)`: Get private property value.
  - `priv(name, value)`: Set private property value.
  - `privHas(name)`: `true` if data has private property `name`.
  - `privKeys()`: Get data's private properties names array.
  - `privDel(name)`: Delete private property `name`.
- Eval:
  - `expression(value)`: Eval expression `value` in data's scope (context contains properties `self`, `root`, `filename`, `dirname` and all properties of current data).
  - `interpolate(value)`: Replace expressions like `${expression}` in text `value`.
