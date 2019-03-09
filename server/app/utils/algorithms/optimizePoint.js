const moku = require('../moku');
const telnet = require('../telnet');
const { getPower } = require('../cpp');
const { ms } = require('../time');
const { asyncLoop, twoDMin } = require('../math');

const parseGlobalStat = globalStat => {
  let index = globalStat.indexOf('Amplitude:');
  const amp = +globalStat.substring(index + 12, index + 16);
  index = globalStat.indexOf('360 Phase:', index + 16);
  const phase = +globalStat.substring(index + 12, index + 16);
  index = globalStat.indexOf('PS1', index + 16);
  const ps1 = +globalStat.substring(index + 15, index + 20);
  index = globalStat.indexOf('PS2', index + 20);
  const ps2 = +globalStat.substring(index + 15, index + 20);
  index = globalStat.indexOf('PD', index + 20);
  const pd = +globalStat.substring(index + 14, index + 19);
  return { amp, phase, ps1, ps2, pd };
};

const getGrid = async (frequency, power, degrees) => {
  const { amp, phase, ps1, ps2, pd } = parseGlobalStat(await telnet.write('GlobalStat'));
  const grid = [];
  await telnet.write(`mp 1 ${ps1 ? 2 : 1} 0 `);
  await asyncLoop((ps1 || ps2) - 10, (ps1 || ps2) + 10, 2, async i => {
    if (i < 0) return;
    grid.push([]);
    const index = grid.length - 1;
    await telnet.write(`mp 1 ${ps1 ? 1 : 2} ${i} `);
    await asyncLoop(pd - 10, pd + 10, 2, async j => {
      if (i < 0) return;
      grid[index].push([frequency, power, degrees, amp, phase, !ps1 ? ps1 : i, !ps2 ? ps2 : i, j]);
      await telnet.write(`mp 1 3 ${j} `);
      await ms(2);
      grid[index][grid[index].length - 1].push(await getPower());
    });
  });
  return grid;
};

module.exports = async (frequency, power, degrees) => {
  await moku.setPoint(frequency, power, degrees);
  const lowest = twoDMin(await getGrid(frequency, power, degrees), 8);
  return lowest;
};
