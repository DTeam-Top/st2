/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import 'colors';
import {createTable} from '../src/stringTable';
import {tableEqual} from './utils';

test('makes a nicely formatted table from a list of objects', t => {
  const objects = [
    {foo: 1, bar: 2},
    {foo: 3, bar: 4},
  ];

  t.true(
    tableEqual(
      createTable(objects),
      `
      | foo | bar |
      -------------
      |   1 |   2 |
      |   3 |   4 |
      `
    )
  );
});

test('makes a nicely formatted table from a single object', t => {
  const object = {foo: 3, bar: 4};

  t.true(
    tableEqual(
      createTable(object),
      `
      | foo | bar |
      -------------
      |   3 |   4 |
      `
    )
  );
});

[null, undefined, '', {}, [], [{}]].forEach(value => {
  test(`returns an empty string for ${JSON.stringify(value)}`, t => {
    t.is(createTable(value), '');
  });
});

test('will filter empty objecs in the list', t => {
  const objects = [null, undefined, '', {}, {foo: 3, bar: 4}];

  t.true(
    tableEqual(
      createTable(objects),
      `
      | foo | bar |
      -------------
      |   3 |   4 |
      `
    )
  );
});

test('aligns strings to the left, other values to the right', t => {
  const objects = [
    {foo: 'a', bar: 1},
    {foo: 'b', bar: 2},
  ];

  t.true(
    tableEqual(
      createTable(objects),
      `
      | foo | bar |
      -------------
      | a   |   1 |
      | b   |   2 |
      `
    )
  );
});

test('aligns headings the same as their values', t => {
  const objects = [
    {a: 'foo', b: 100},
    {a: 'bar', b: 200},
  ];

  t.true(
    tableEqual(
      createTable(objects),
      `
      | a   |   b |
      -------------
      | foo | 100 |
      | bar | 200 |
      `
    )
  );
});

test('resizes rows to fit multiline strings', t => {
  const objects = [
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
      createTable(objects, {rowSeparator: '-'}),
      `
      | title              | opening                         |
      --------------------------------------------------------
      | The Cat in the Hat | The sun did not shine.          |
      |                    | It was too wet to play.         |
      |                    | So we sat in the house          |
      |                    | All that cold, cold, wet day.   |
      --------------------------------------------------------
      | Green Eggs and Ham | I am Sam.                       |
      |                    | Sam I am.                       |
      |                    | Do you like green eggs and ham? |
      `
    )
  );
});
