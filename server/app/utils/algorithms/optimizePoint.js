const moku = require('../moku');
const telnet = require('../telnet');
const { getPower } = require('../cpp');
const { ms } = require('../time');
const { asyncLoop, twoDMin } = require('../math');
const applyTable = require('../lookupTable/apply');

const getGrid = async (frequency, power, degrees, amp, phase, ps1, ps2, pd, iteration = 0, prevLowest) => {
  const grid = [];
  console.log(power, degrees); // eslint-disable-line no-console
  await telnet.write(`mp 1 ${ps1 > ps2 ? 2 : 1} ${ps1 > ps2 ? ps2 : ps1} `);
  let times;
  let skip;
  if (iteration === 0) {
    times = 2;
    skip = 0;
  } else if (iteration === 1) {
    times = 5;
    skip = 2;
  } else if (iteration === 2) {
    times = 10;
    skip = 5;
  } else if (iteration === 3) {
    times = 20;
    skip = 10;
  }
  const prevWasTopSide = prevLowest && prevLowest[ps1 > ps2 ? 5 : 6] > (ps1 > ps2 ? ps1 : ps2);
  let lowTracker = 0;
  await asyncLoop(
    prevWasTopSide ? (ps1 > ps2 ? ps1 : ps2) + times : (ps1 > ps2 ? ps1 : ps2) - times,
    prevWasTopSide ? (ps1 > ps2 ? ps1 : ps2) - times : (ps1 > ps2 ? ps1 : ps2) + times,
    prevWasTopSide ? -1 : 1,
    async (i, checkSide) => {
      if (checkSide && iteration > 0 && lowTracker < [-60, -50, -40][iteration]) return 'stop loop';
      if (i < 0 || i > 511) return false;
      grid.push([]);
      const index = grid.length - 1;
      await telnet.write(`mp 1 ${ps1 > ps2 ? 1 : 2} ${i} `);
      return asyncLoop(
        prevWasTopSide ? pd + times : pd - times,
        prevWasTopSide ? pd - times : pd + times,
        prevWasTopSide ? -1 : 1,
        async j => {
          if (j < 0 || j > 511) return;
          grid[index].push([frequency, power, degrees, amp, phase, ps1 > ps2 ? i : 0, ps1 > ps2 ? 0 : i, j]);
          await telnet.write(`mp 1 3 ${j} `);
          await ms(2);
          let data;
          try {
            data = await getPower();
          } catch (e) {
            try {
              await ms(1000);
              data = await getPower();
            } catch (er) {
              data = 0;
            }
          }
          grid[index][grid[index].length - 1].push(data);
          const correctedValue = data + (10 - Math.abs(power));
          grid[index][grid[index].length - 1].push(correctedValue);
          lowTracker = lowTracker < correctedValue ? lowTracker : correctedValue;
        },
        [skip, pd]
      );
    },
    [skip, ps1 > ps2 ? ps1 : ps2]
  );
  let lowest = twoDMin(grid, 9);
  if (prevLowest && prevLowest[9] < lowest[9]) {
    lowest = prevLowest;
  }
  return iteration === 3 || lowest[9] < [-50, -40, -32][iteration]
    ? lowest
    : getGrid(frequency, power, degrees, amp, phase, ps1, ps2, pd, iteration + 1, lowest);
};

module.exports = async (frequency, power, degrees, usingTable) => {
  await moku.setPoint(frequency, power, degrees);
  await ms(10);
  let amp;
  let phase;
  let ps1;
  let ps2;
  let pd;
  if (usingTable === 'firmware') ({ amp, phase, ps1, ps2, pd } = await telnet.parseGlobalStat());
  else ({ amp, phase, ps1, ps2, pd } = await applyTable('fine', usingTable));
  const lowest = await getGrid(frequency, power, degrees, amp, phase, ps1, ps2, pd);
  return lowest;
};
