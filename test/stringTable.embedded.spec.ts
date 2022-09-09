/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import 'colors';
import {createTable} from '../src/stringTable';
import {tableEqual} from './utils';

test('supports an object field', t => {
  const object = {foo: 3, bar: {a: 2, b: 1}};

  t.true(
    tableEqual(
      createTable(object),
      `
      | foo | bar       |
      -------------------
      |   3 | | a | b | |
      |     | --------- |
      |     | | 2 | 1 | |
      `
    )
  );
});

test('supports an object array field', t => {
  const object = {
    foo: 3,
    bar: [
      {a: 2, b: 1},
      {a: 3, b: 4},
    ],
  };

  t.true(
    tableEqual(
      createTable(object),
      `
      | foo | bar       |
      -------------------
      |   3 | | a | b | |
      |     | --------- |
      |     | | 2 | 1 | |
      |     | | 3 | 4 | |
      `
    )
  );
});

test('applies a formatter to an embeded object field.', t => {
  const numbers = [
    {outValue: 1, insideValue: {a: 1, b: 'a1'}},
    {outValue: 2, insideValue: {a: 2, b: 'a2'}},
    {outValue: 3, insideValue: {a: 3, b: 'a3'}},
  ];

  t.true(
    tableEqual(
      createTable(numbers, {
        formatters: {
          insideValue: {
            a: (value: number) => value.toFixed(2),
            b: (value: string) => value.toUpperCase(),
          },
        },
        rowSeparator: '-',
      }),
      `
      | outValue | insideValue   |
      ----------------------------
      |        1 | | a    | b  | |
      |          | ------------- |
      |          | | 1.00 | A1 | |
      ----------------------------
      |        2 | | a    | b  | |
      |          | ------------- |
      |          | | 2.00 | A2 | |
      ----------------------------
      |        3 | | a    | b  | |
      |          | ------------- |
      |          | | 3.00 | A3 | |
      `
    )
  );
});

test('a custom type formatter will impact on embeded object field.', t => {
  const numbers = [
    {outValue: 1, insideValue: {value: 1}},
    {outValue: 2, insideValue: {value: 2}},
    {outValue: 3, insideValue: {value: 3}},
  ];

  t.true(
    tableEqual(
      createTable(numbers, {
        typeFormatters: {
          number: (value: number) => value.toFixed(2),
        },
        rowSeparator: '-',
      }),
      `
      | outValue | insideValue |
      --------------------------
      | 1.00     | | value |   |
      |          | ---------   |
      |          | | 1.00  |   |
      --------------------------
      | 2.00     | | value |   |
      |          | ---------   |
      |          | | 2.00  |   |
      --------------------------
      | 3.00     | | value |   |
      |          | ---------   |
      |          | | 3.00  |   |
      `
    )
  );
});
