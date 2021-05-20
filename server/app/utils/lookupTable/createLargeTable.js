const {
  promises: { writeFile, appendFile, stat, mkdir },
} = require('fs');
const { asyncLoop } = require('../math');
const { readTable } = require('../csv');

const lookupTableLocation = './server/app/utils/lookupTable/local';
const largeLookupTable = frequency => `${lookupTableLocation}/${frequency}_MHz_Large.csv`;

module.exports = async (frequency, ampStep = 10, phaseStep = 30) => {
  try {
    await stat(lookupTableLocation);
  } catch (e) {
    await mkdir(lookupTableLocation);
  }
  await writeFile(largeLookupTable(frequency), []);
  const table = await readTable(`${__dirname}/local/${frequency}_MHz.csv`);
  await asyncLoop(850, 2150, ampStep, async i => {
    await asyncLoop(0, 6600, phaseStep, async j => {
      console.log(frequency, i, j); // eslint-disable-line no-console
      let closest = [];
      let closestDistance = 0;
      table.forEach(cell => {
        const d1 = Math.sqrt(((i - +cell[3]) * 3.2) ** 2 + (j - +cell[4]) ** 2);
        const d2 = j < 200 ? Math.sqrt(((i - +cell[3]) * 3.2) ** 2 + (j + 6450 - +cell[4]) ** 2) : d1;
        const d3 = j > 6200 ? Math.sqrt(((i - +cell[3]) * 3.2) ** 2 + (j - 6450 - +cell[4]) ** 2) : d1;
        const distance = Math.min(d1, d2, d3);
        if (!closest.length || distance < closestDistance) {
          closest = cell;
          closestDistance = distance;
        }
      });
      closest = closest.map(item => +item);
      const [, , , , , ps1, ps2, pd] = closest;
      await appendFile(largeLookupTable(frequency), `${i},${j},${ps1},${ps2},${pd}\n`);
    });
  });
};
