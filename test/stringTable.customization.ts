/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import 'colors';
import {createTable} from '../src/stringTable';
import {tableEqual} from './utils';

const baseObjects: Array<any> = [
  {a: 'app', b: 'bow', c: 'cow'},
  {a: 'arc', b: 'bra', c: 'cap'},
];

test('allows you to specify which column headings to include', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {headers: ['a', 'c']}),
      `
      | a   | c   |
      -------------
      | app | cow |
      | arc | cap |
      `
    )
  );
});

test('provides the option of capitalizing column headings', t => {
  const things = [
    {foo: 'app', bar: 'bow'},
    {foo: 'arc', bar: 'bra'},
  ];

  t.true(
    tableEqual(
      createTable(things, {capitalizeHeaders: true}),
      `
      | Foo | Bar |
      -------------
      | app | bow |
      | arc | bra |
      `
    )
  );
});

test('allows you to specify custom outer and inner borders', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {outerBorder: '||', innerBorder: '*'}),
      `
      || a   * b   * c   ||
      ---------------------
      || app * bow * cow ||
      || arc * bra * cap ||
      `
    )
  );
});

test('allows you to specify a row separator', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {rowSeparator: ':'}),
      `
      | a   | b   | c   |
      -------------------
      | app | bow | cow |
      :::::::::::::::::::
      | arc | bra | cap |
      `
    )
  );
});

test('allows the row separator to be multiple characters', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {rowSeparator: '+-*/'}),
      `
      | a   | b   | c   |
      -------------------
      | app | bow | cow |
      +-*/+-*/+-*/+-*/+-*
      | arc | bra | cap |
      `
    )
  );
});

test('allows you to specify a custom header separator', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {headerSeparator: 'x'}),
      `
      | a   | b   | c   |
      xxxxxxxxxxxxxxxxxxx
      | app | bow | cow |
      | arc | bra | cap |
      `
    )
  );
});

test('allows you to specify a custom formatter for each column', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {
        formatters: {c: (value: string) => value.toUpperCase()},
      }),
      `
      | a   | b   | c   |
      -------------------
      | app | bow | COW |
      | arc | bra | CAP |
      `
    )
  );
});

const users = [
  {name: 'Dan', gender: 'M', age: 29},
  {name: 'Adam', gender: 'M', age: 31},
  {name: 'Lauren', gender: 'F', age: 33},
];

test('applies no formatting if none is given', t => {
  t.true(
    tableEqual(
      createTable(users, {
        formatters: {
          gender: (value: string) => value,
        },
      }),
      `
      | name   | gender | age |
      -------------------------
      | Dan    | M      |  29 |
      | Adam   | M      |  31 |
      | Lauren | F      |  33 |
      `
    )
  );
});

test('applies colors, if specified', t => {
  t.true(
    tableEqual(
      createTable(users, {
        formatters: {
          gender: (value: string) => {
            return {
              value,
              format: {color: value === 'M' ? 'cyan' : 'magenta'},
            };
          },
        },
      }),
      `
      | name   | gender | age |
      -------------------------
      | Dan    | ${'M'.cyan}      |  29 |
      | Adam   | ${'M'.cyan}      |  31 |
      | Lauren | ${'F'.magenta}      |  33 |
      `
    )
  );
});

test('applies alignment, if specified', t => {
  t.true(
    tableEqual(
      createTable(users, {
        formatters: {
          gender: (value: string) => {
            return {
              value,
              format: {alignment: 'right'},
            };
          },
        },
      }),
      `
      | name   | gender | age |
      -------------------------
      | Dan    |      M |  29 |
      | Adam   |      M |  31 |
      | Lauren |      F |  33 |
      `
    )
  );
});

test('applies alignment to multi-line values as well', t => {
  const books = [
    {
      title: 'The Cat in the Hat',
      opening: [
        'The sun did not shine.',
        'It was too wet to play.',
        'So we sat in the house',
        'All that cold, cold, wet day.',
      ].join('\n'),
    },
    {
      title: 'Green Eggs and Ham',
      opening: [
        'I am Sam.',
        'Sam I am.',
        'Do you like green eggs and ham?',
      ].join('\n'),
    },
  ];

  t.true(
    tableEqual(
      createTable(books, {
        formatters: {
          opening: (value: string) => {
            return {
              value,
              format: {alignment: 'right'},
            };
          },
        },
        headerSeparator: '=',
        rowSeparator: '-',
      }),
      `
      | title              | opening                         |
      ========================================================
      | The Cat in the Hat |          The sun did not shine. |
      |                    |         It was too wet to play. |
      |                    |          So we sat in the house |
      |                    |   All that cold, cold, wet day. |
      --------------------------------------------------------
      | Green Eggs and Ham |                       I am Sam. |
      |                    |                       Sam I am. |
      |                    | Do you like green eggs and ham? |
      `
    )
  );
});

test('allows you to specify a custom formatter for a given type', t => {
  const numbers = [
    {name: 'one', value: 1},
    {name: 'two', value: 2},
    {name: 'three', value: 3},
  ];

  t.true(
    tableEqual(
      createTable(numbers, {
        typeFormatters: {
          number: (value: number) => value.toFixed(2),
        },
      }),
      `
      | name  | value |
      -----------------
      | one   | 1.00  |
      | two   | 2.00  |
      | three | 3.00  |
      `
    )
  );
});

test('passes both value and column header to custom type formatters', t => {
  const people = [
    {firstName: 'Dan', lastName: 'Tao', middleInitial: 'L'},
    {firstName: 'Joe', lastName: 'Schmoe', middleInitial: 'K'},
    {firstName: 'Johnny', lastName: 'Public', middleInitial: 'Q'},
  ];

  t.true(
    tableEqual(
      createTable(people, {
        typeFormatters: {
          string: (value: string, header: string) => {
            return header.endsWith('Name')
              ? value.toUpperCase()
              : value.toLowerCase();
          },
        },
      }),
      `
      | firstName | lastName | middleInitial |
      ----------------------------------------
      | DAN       | TAO      | l             |
      | JOE       | SCHMOE   | k             |
      | JOHNNY    | PUBLIC   | q             |
      `
    )
  );
});

test('gives precedence to a column-specific formatter before a type formatter', t => {
  t.true(
    tableEqual(
      createTable(baseObjects, {
        formatters: {b: (value: string) => value.toUpperCase()},
        typeFormatters: {
          string: (value: string) => {
            return value.substring(0, 2);
          },
        },
      }),
      `
      | a  | b   | c  |
      -----------------
      | ap | BOW | co |
      | ar | BRA | ca |
      `
    )
  );
});

test('by default, outputs the empty string for null an undefined', t => {
  baseObjects[0].a = null;
  baseObjects[0].b = undefined;
  baseObjects[0].c = 0;

  t.true(
    tableEqual(
      createTable(baseObjects),
      `
      | a   | b   |   c |
      -------------------
      |     |     |   0 |
      | arc | bra | cap |
      `
    )
  );
});

test('can adjust column widths for colored output', t => {
  const palette = [
    {name: 'success', color: 'green'.green},
    {name: 'info', color: 'blue'.blue},
    {name: 'warning', color: 'yellow'.yellow},
    {name: 'danger', color: 'red'.red},
  ];

  t.true(
    tableEqual(
      createTable(palette),
      `
      | name    | color  |
      --------------------
      | success | ${'green'.green}  |
      | info    | ${'blue'.blue}   |
      | warning | ${'yellow'.yellow} |
      | danger  | ${'red'.red}    |
      `
    )
  );
});
