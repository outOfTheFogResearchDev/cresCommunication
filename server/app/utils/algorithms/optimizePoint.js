const moku = require('../moku');
const telnet = require('../telnet');
const { getPower } = require('../cpp');
const { ms } = require('../time');
const { asyncLoop, twoDMin } = require('../math');

const getGrid = async (frequency, power, degrees, amp, phase, ps1, iteration = 0, prevLowest) => {
  const grid = [];
  let psStart;
  let psStop;
  let pdStart;
  let pdStop;
  let step;
  if (iteration === 0) {
    psStart = 25;
    psStop = 475;
    pdStart = 25;
    pdStop = 475;
    step = 50;
  } else if (iteration === 1) {
    psStart = prevLowest[ps1 ? 5 : 6] - 25;
    psStop = prevLowest[ps1 ? 5 : 6] + 25;
    pdStart = prevLowest[7] - 25;
    pdStop = prevLowest[7] + 25;
    step = 5;
  } else if (iteration === 2) {
    psStart = prevLowest[ps1 ? 5 : 6] - 3;
    psStop = prevLowest[ps1 ? 5 : 6] + 3;
    pdStart = prevLowest[7] - 3;
    pdStop = prevLowest[7] + 3;
    step = 1;
  }
  await asyncLoop(psStart, psStop, step, async i => {
    if (i < 0 || i > 511) return null;
    grid.push([]);
    const index = grid.length - 1;
    await telnet.write(`mp 1 ${ps1 ? 1 : 2} ${i} `);
    return asyncLoop(pdStart, pdStop, step, async j => {
      if (j < 0 || j > 511) return null;
      grid[index].push([frequency, power, degrees, amp, phase, ps1 ? i : 0, ps1 ? 0 : i, j]);
      await telnet.write(`mp 1 3 ${j} `);
      await ms(5);
      let data;
      try {
        data = await getPower();
      } catch (e) {
        try {
          console.log('getPower 1 failed'); // eslint-disable-line no-console
          await ms(1000);
          data = await getPower();
        } catch (er) {
          console.log('getPower 2 failed'); // eslint-disable-line no-console
          data = 0;
        }
      }
      grid[index][grid[index].length - 1].push(data);
      const correctedValue = data + (10 - Math.abs(power));
      grid[index][grid[index].length - 1].push(correctedValue);
      if (correctedValue < [-27, -40, -60][iteration]) return 'stop loop';
      return null;
    });
  });
  const lowest = twoDMin(grid, 9);
  return iteration === 2 ? lowest : getGrid(frequency, power, degrees, amp, phase, ps1, iteration + 1, lowest);
};

module.exports = async (frequency, power, degrees, prevPoint = []) => {
  console.log(power, degrees); // eslint-disable-line no-console
  await moku.setPoint(frequency, power, degrees);
  await ms(10);
  const { amp, phase, ps1, ps2 } = await telnet.parseGlobalStat();
  await telnet.write(`mp 1 ${ps1 > ps2 ? 2 : 1} 0 `);
  return prevPoint.length
    ? getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, 1, prevPoint)
    : getGrid(frequency, power, degrees, amp, phase, ps1 > ps2);
};
