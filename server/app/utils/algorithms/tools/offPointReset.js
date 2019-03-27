const { readTable, writeTemp } = require('../../csv');

module.exports = async frequency => {
  const table = await readTable(`${__dirname}/../../lookupTable/local/${frequency}_MHz.csv`);
  const grid = {};
  const newTable = [];
  table.forEach(cell => {
    const row = cell[1];
    if (!grid[row]) grid[row] = [];
    grid[row].push(cell);
  });
  Object.keys(grid).forEach(row => {
    const array = grid[row].slice();
    array.sort((a, b) => a[7] - b[7]);
    const mid = array.length / 2;
    const median = mid % 1 ? array[mid - 0.5][7] : (array[mid - 1][7] + array[mid][7]) / 2;
    grid[row].forEach(cell => {
      const newCell = cell.slice();
      if (Math.abs(cell[7] - median) > 10) newCell[7] = median;
      newTable.push(newCell);
    });
  });
  await writeTemp(newTable, `${__dirname}/../../lookupTable/local`);
};
