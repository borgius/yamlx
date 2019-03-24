# yamlx

YAML loader (eXtended)

> forked from https://github.com/teniryte/xyaml

```js
const yamlx = require('yamlx');

var data = yamlx.loadFile(__dirname + '/settings.yaml');
```

## YAML File Example

```yaml
# Regular Properties
port: 8080
domain: test.ru

# To String
portStr: ~str(${self.port})

# To Number
portNum: ~num(${self.portStr})

# Interpolation: «test.ru:8080»
url: ${domain}:${port}

# Include File «icons.yaml» Relative to Current Directory
icons: ~include(icons)

# Include File By URL (Download and Include)
icons: ~include(hhttps://raw.githubusercontent.com/borgius/yamlx/master/test/data/admin.yaml)

# Download Text From URL
script: ~download(https://raw.githubusercontent.com/borgius/yamlx/master/test/data/admin.yaml)
```

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
