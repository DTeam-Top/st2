export function tableEqual(actual: string, expected: string): boolean {
  const actualRows = actual.split('\n');
  //remove any empty lines in "expected".
  const expectedRows = expected.split('\n').filter(item => item.trim());

  const result =
    actualRows.length === expectedRows.length &&
    actualRows.every((row, index) => {
      return row === expectedRows[index].trim();
    });

  if (!result) {
    console.error(concatTables(actualRows, expectedRows));
  }

  return result;
}

function concatTables(
  table1Rows: string[],
  table2Rows: string[],
  equal = false
): string {
  let rows1: string[];
  let rows2: string[];
  if (table1Rows.length >= table2Rows.length) {
    rows1 = table1Rows;
    rows2 = table2Rows;
  } else {
    rows1 = table2Rows;
    rows2 = table1Rows;
  }

  const location = Math.floor(rows1.length / 2);
  const result = rows1.map((row, index) => {
    if (index === location) {
      return row.concat(equal ? '   ===' : '   !==', rows2[index] || '');
    } else {
      if (index < rows2.length) {
        return row.concat('      ', rows2[index]);
      } else {
        return row;
      }
    }
  });

  return result.join('\n');
}
