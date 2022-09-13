# st2

![build](https://github.com/DTeam-Top/st2/actions/workflows/ci.yml/badge.svg)
![check-code-coverage](https://img.shields.io/badge/code--coverage-80%25-brightgreen)
[![npm](https://img.shields.io/npm/dt/@dteam/st2)](https://www.npmjs.com/package/@dteam/st2)
[![npm (scoped)](https://img.shields.io/npm/v/@dteam/st2)](https://www.npmjs.com/package/@dteam/st2)

st2 is [string-table](https://github.com/dtao/string-table) refactored in TypeScirpt with more enhancements:

- add type information, then it can be used in modern IDE like vscode to work with IntelliSense.
- return an empty string for `null`, `undefined`, `''`, `{}`, `[]` and `[{}]` by default.
- accept a single object input, ie, treat it as an array including only one element.
- support object properties.
- filter out "empty" items (`null`, `undefined`, `{}` and `''`) in the input array automatically.
- rewrite all tests in TypeScirpt, using [ava](https://github.com/avajs/ava) and [c8](https://www.npmjs.com/package/c8).

## Installation

```sh
npm install @dteam/st2
```

## Example

```ts
import {createTable} from '@dteam/st2';

const users = [
  {name: 'Dan', gender: 'M', age: 29},
  {name: 'Adam', gender: 'M', age: 31},
  {name: 'Lauren', gender: 'F', age: 33},
];

createTable(users);

/*
 * Result:
 *
 * | name   | gender | age |
 * -------------------------
 * | Dan    | M      |  29 |
 * | Adam   | M      |  31 |
 * | Lauren | F      |  33 |
 */
```

For the input of `createTable`, please note:

- a single object will be treat as `[object]`.
- `null`, `undefined`, `''`, `{}`, `[]` and `[{}]` will return an empty string.
- "empty" items in the input will be removed, fox examples:

```ts
createTable([null, undefined, '', {}, {foo: 3, bar: 4}]);

/*
 * Result:
 *
 * | foo | bar |
 * -------------
 * |   3 |   4 |
 */
```

Please check [the test files](test) for all usage examples.

## Options

You can also specify options to customize how the table is formatted:

```ts
const table = createTable(users, options);
```

The available options are summarized below.

### `headers`

An array of strings indicating which column headers to include (and in what order)

_Default: every property from the first object in the list_

#### Example

```ts
createTable(users, {headers: ['age', 'name']});

/*
 * Result:
 *
 * | age | name   |
 * ----------------
 * |  29 | Dan    |
 * |  31 | Adam   |
 * |  33 | Lauren |
 */
```

### `capitalizeHeaders`

Whether or not to capitalize the table's column headers

_Default: `false`_

#### Example

```ts
createTable(users, {capitalizeHeaders: true});

/*
 * Result:
 *
 * | Name   | Gender | Age |
 * -------------------------
 * | Dan    | M      |  29 |
 * | Adam   | M      |  31 |
 * | Lauren | F      |  33 |
 */
```

### `formatters`

An object mapping column names to formatter functions, which will accept `(value, header)` arguments

_Default: none_

#### Example

```ts
createTable(users, {
  formatters: {
    name: function (value, header) {
      return value.toUpperCase();
    },
  },
});

/*
 * Result:
 *
 * | name   | gender | age |
 * -------------------------
 * | DAN    | M      |  29 |
 * | ADAM   | M      |  31 |
 * | LAUREN | F      |  33 |
 */
```

A formatter may also return an object with the properties `{ value, format }`, where `format` in turn can have the properties `{ color, alignment }`.

```ts
createTable(users, {
  formatters: {
    gender: function (value, header) {
      return {
        value: value,
        format: {
          color: value === 'M' ? 'cyan' : 'magenta',
          alignment: 'right',
        },
      };
    },
  },
});

/*
 * Result:
 *
 * | name   | gender |    age |
 * ----------------------------
 * | Dan    |      M |  29.00 |
 * | Adam   |      M |  31.00 |
 * | Lauren |      F |  33.00 |
 *
 * (Imagine the Ms are cyan and the F is magenta above.)
 */
```

For internal objects properties, you can use formatters too.

```ts
const numbers = [
  {outValue: 1, insideValue: {a: 1, b: 'a1'}},
  {outValue: 2, insideValue: {a: 2, b: 'a2'}},
  {outValue: 3, insideValue: {a: 3, b: 'a3'}},
];

createTable(numbers, {
  formatters: {
    insideValue: {
      a: (value: number) => value.toFixed(2),
      b: (value: string) => value.toUpperCase(),
    },
  },
  rowSeparator: '-',
});

/*
 * Result:
 *
 * | outValue | insideValue   |
 * ----------------------------
 * |        1 | | a    | b  | |
 * |          | ------------- |
 * |          | | 1.00 | A1 | |
 * ----------------------------
 * |        2 | | a    | b  | |
 * |          | ------------- |
 * |          | | 2.00 | A2 | |
 * ----------------------------
 * |        3 | | a    | b  | |
 * |          | ------------- |
 * |          | | 3.00 | A3 | |
 *
 */
```

### `typeFormatters`

An object mapping data _types_ (`'string'`, `'number'`, `'boolean'`, etc.) to formatter functions (has lower precedence than `formatters` option)

_Default: none_

#### Example

```ts
createTable(users, {
  typeFormatters: {
    number: function (value, header) {
      return value.toFixed(2);
    },
  },
});

/*
 * Result:
 *
 * | name   | gender |    age |
 * ----------------------------
 * | Dan    | M      |  29.00 |
 * | Adam   | M      |  31.00 |
 * | Lauren | F      |  33.00 |
 */
```

A type formatters will also be applied for the values in the internal objects with the same type.

```ts
const numbers = [
  {outValue: 1, insideValue: {value: 1}},
  {outValue: 2, insideValue: {value: 2}},
  {outValue: 3, insideValue: {value: 3}},
];

createTable(numbers, {
  typeFormatters: {
    number: (value: number) => value.toFixed(2),
  },
  rowSeparator: '-',
});

/*
 * Result:
 *
 * | outValue | insideValue |
 * --------------------------
 * | 1.00     | | value |   |
 * |          | ---------   |
 * |          | | 1.00  |   |
 * --------------------------
 * | 2.00     | | value |   |
 * |          | ---------   |
 * |          | | 2.00  |   |
 * --------------------------
 * | 3.00     | | value |   |
 * |          | ---------   |
 * |          | | 3.00  |   |
 */
```

### `outerBorder` and `innerBorder`

The character(s) used to enclose the table and to delimit cells within the table, respectively

_Defaults: `'|'` for both_

#### Example

```ts
createTable(users, {
  outerBorder: '%',
  innerBorder: '$',
});

/*
 * Result:
 *
 * % name   $ gender $ age %
 * -------------------------
 * % Dan    $ M      $  29 %
 * % Adam   $ M      $  31 %
 * % Lauren $ F      $  33 %
 */
```

### `rowSeparator`

The character used to separate rows in the table

_Default: none_

#### Example

```ts
createTable(users, {rowSeparator: '~'});

/*
 * Result:
 *
 * | name   | gender | age |
 * -------------------------
 * | Dan    | M      |  29 |
 * ~~~~~~~~~~~~~~~~~~~~~~~~~
 * | Adam   | M      |  31 |
 * ~~~~~~~~~~~~~~~~~~~~~~~~~
 * | Lauren | F      |  33 |
 */
```

### `headerSeparator`

The character used to separate the header row from the table body

_Default: `'-'`_

#### Example

```ts
createTable(users, {headerSeparator: '*'});

/*
 * Result:
 *
 * | name   | gender | age |
 * *************************
 * | Dan    | M      |  29 |
 * | Adam   | M      |  31 |
 * | Lauren | F      |  33 |
 */
```

Again, [the test files](test) shows all examples with different options.

## How to deploy

1. `npm login`
1. `npm run build`
1. `npm publish`

Note: if you changed `registry` in your `~/.npmrc`, you need to comment it out before deployment.

## Thanks

Finally, we want to thank [string-table](https://github.com/dtao/string-table) for providing a great way to show a list of structure data in cli. Without it, st2 will not happen.
