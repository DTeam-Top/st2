type Formatter = (
  value: any,
  header: string
) =>
  | string
  | {
      value: string;
      format?: Partial<{
        color: string;
        alignment: 'left' | 'right';
      }>;
    };

type Formatters = {
  [key: string]: Formatter | {[key: string]: Formatter};
};

type TypeFormatters = Partial<{
  [key in
    | 'undefined'
    | 'object'
    | 'string'
    | 'number'
    | 'boolean'
    | 'bigint'
    | 'symbol']: Formatter;
}>;

type Options = {
  headers: string[];
  outerBorder: string;
  innerBorder: string;
  headerSeparator: string;
  rowSeparator: string;
  capitalizeHeaders: boolean;
  formatters: Formatters;
  typeFormatters: TypeFormatters;
};

export function createTable(
  input: any | Array<any>,
  options?: Partial<Options>
) {
  const records = (Array.isArray(input) ? input : [input]).filter(
    item => item && Object.keys(item).length
  );

  if (!records.length) {
    return '';
  }

  const optionsInternal = options || {};

  const headers = optionsInternal?.headers || Object.keys(records[0]);
  const outerBorder = optionsInternal?.outerBorder || '|';
  const innerBorder = optionsInternal?.innerBorder || '|';
  const headerSeparator = optionsInternal?.headerSeparator || '-';
  const rowSeparator = optionsInternal?.rowSeparator;
  const capitalizeHeaders = optionsInternal?.capitalizeHeaders || false;
  const formatters = optionsInternal?.formatters || {};
  const typeFormatters = optionsInternal?.typeFormatters || {};
  const rows = [createHeaderRow(headers, capitalizeHeaders)];
  const formats: any = [];

  for (const record of records) {
    // Yes, this is getting completely out of hand.
    appendRowAndFormat(
      record,
      headers,
      formatters,
      typeFormatters,
      rows,
      formats
    );
  }

  let totalWidth =
    // Width of outer border on each side
    strLength(outerBorder) * 2 +
    // There will be an inner border between each cell, hence 1 fewer than total # of cells
    strLength(innerBorder) * (headers.length - 1) +
    // Each cell is padded by an additional space on either side
    headers.length * 2;

  const columnWidths = [];
  for (let i = 0; i < rows[0].length; ++i) {
    const columnWidth = getMaxWidth(rows, i);
    columnWidths.push(columnWidth);
    totalWidth += columnWidth;
  }

  const columnTypes = [];
  for (let i = 0; i < rows[0].length; ++i) {
    columnTypes.push(getColumnType(rows, i));
  }

  const formattedLines = [];
  for (let i = 0; i < rows.length; ++i) {
    const row = rows[i];
    const cellFormats = formats[i - 1];
    // Determine the height of each row
    const rowHeight = getMaxHeight(row);
    let currentLine;

    // Get the lines of each cell once, so we don't have to keep splitting
    // over and over in the loop after this one.
    const cellLines = [];
    for (const element of row) {
      cellLines.push(String(element).split('\n'));
    }

    // Print the row one line at a time (this requires revisiting each cell N times for N lines)
    for (let line = 0; line < rowHeight; ++line) {
      currentLine = [];

      for (let j = 0; j < row.length; ++j) {
        const width = columnWidths[j];
        const type = columnTypes[j];
        const format = i > 0 && cellFormats[j];
        const lines = cellLines[j];
        currentLine.push(formatCell(lines[line] || '', width, type, format));
      }

      formattedLines.push(
        outerBorder +
          ' ' +
          currentLine.join(' ' + innerBorder + ' ') +
          ' ' +
          outerBorder
      );
    }

    if (rowSeparator && i > 0 && i < rows.length - 1) {
      formattedLines.push(createRowSeparator(totalWidth, rowSeparator));
    }

    // Add the header separator right after adding the header
    if (i === 0) {
      formattedLines.push(createRowSeparator(totalWidth, headerSeparator));
    }
  }

  return formattedLines.join('\n');
}

function appendRowAndFormat(
  data: any,
  headers: string[],
  formatters: Formatters,
  typeFormatters: TypeFormatters,
  rows: string[][],
  formats: any
) {
  const row = [],
    cellFormats = [];

  for (const element of headers) {
    const header = element;
    let value = data[header];
    const typeOf = typeof value;
    if (typeOf === 'function') {
      continue;
    }

    let formatter =
      formatters[header] ||
      typeFormatters[typeOf] ||
      identityCreator(value, formatters, typeFormatters);

    if (typeof formatter === 'object') {
      formatter = identityCreator(value, formatter, typeFormatters);
    }

    const formatted = formatter(value, header);
    if (formatted && typeof formatted === 'object') {
      value = formatted.value;
      if (formatted.format && formatted.format.color) {
        value = value[formatted.format.color];
      }
      cellFormats.push(formatted.format);
    } else {
      value = formatted;
      cellFormats.push(null);
    }

    row.push(value);
  }

  rows.push(row);
  formats.push(cellFormats);
}

function createHeaderRow(headers: string[], capitalizeHeaders: boolean) {
  const row = Array.prototype.slice.call(headers, 0);
  if (capitalizeHeaders) {
    for (let i = 0; i < row.length; ++i) {
      row[i] = capitalize(row[i]);
    }
  }
  return row;
}

function createRowSeparator(totalWidth: number, separator: string) {
  return repeatToLength(separator, totalWidth);
}

function getMaxWidth(rows: string[][], columnIndex: number) {
  let maxWidth = 0;
  let lines;
  for (const row of rows) {
    lines = String(row[columnIndex]).split('\n');
    for (const line of lines) {
      maxWidth = Math.max(maxWidth, strLength(line));
    }
  }
  return maxWidth;
}

function getMaxHeight(row: string[]) {
  let maxHeight = 1;
  for (const element of row) {
    maxHeight = Math.max(maxHeight, lineCount(String(element)));
  }
  return maxHeight;
}

function getColumnType(rows: string[][], columnIndex: number) {
  return rows[1] && typeof rows[1][columnIndex];
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.substring(1);
}

function formatCell(value: string, width: number, type: string, format: any) {
  const padding = width - strLength(value);

  const alignment =
    (format && format.alignment) || (type === 'number' ? 'right' : 'left');

  switch (alignment) {
    case 'right':
      return padRight(value, padding);
    case 'left':
    default:
      return padLeft(value, padding);
  }
}

function strLength(value: string) {
  // eslint-disable-next-line no-control-regex
  return String(value).replace(/\u001b\[\d{1,2}m?/g, '').length;
}

/**
 * @examples
 * countOccurrences('foo', 'f') => 1
 * countOccurrences('foo', 'o') => 2
 * countOccurrences('bar', 'z') => 0
 */
function countOccurrences(str: string, char: string) {
  let count = 0;
  let index = str.indexOf(char);

  while (index !== -1) {
    ++count;
    index = str.indexOf(char, index + char.length);
  }

  return count;
}

function lineCount(str: string) {
  return countOccurrences(str, '\n') + 1;
}

/**
 * @examples
 * padLeft('foo', 2) => 'foo  '
 * padLeft('foo', 0) => 'foo'
 */
function padLeft(value: string, padding: number) {
  return value + repeat(' ', padding);
}

/**
 * @examples
 * padRight('foo', 2) => '  foo'
 * padRight('foo', 0) => 'foo'
 */
function padRight(value: string, padding: number) {
  return repeat(' ', padding) + value;
}

/**
 * @examples
 * repeat('a', 3)   => 'aaa'
 * repeat('abc', 3) => 'abcabcabc'
 * repeat('a', 0)   => ''
 */
function repeat(value: string, count: number) {
  return new Array(count + 1).join(value);
}

/**
 * @examples
 * repeatToLength('a', 3)   => 'aaa'
 * repeatToLength('foo', 7) => 'foofoof'
 */
function repeatToLength(value: string, length: number) {
  if (length < value.length) {
    return value.substring(0, length);
  }

  let str = value;
  while (str.length * 2 < length) {
    str += str;
  }

  str += str.substring(0, length - str.length);

  return str;
}

function identityCreator(value: any, formatters: any, typeFormatters: any) {
  return (value: any) => {
    if (typeof value !== 'number' && !value) {
      return '';
    } else if (value && typeof value === 'object') {
      return createTable(value, {formatters, typeFormatters});
    }
    return value;
  };
}
