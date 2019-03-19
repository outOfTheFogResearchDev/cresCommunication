const moku = require('../moku');
const telnet = require('../telnet');
const { getPower } = require('../cpp');
const { ms } = require('../time');
const { asyncLoop, twoDMin } = require('../math');
const applyTable = require('../lookupTable/apply');

const getGrid = async (frequency, power, degrees, amp, phase, ps1, ps2, pd, iteration = 0, prevLowest) => {
  const grid = [];
  console.log(power, degrees);
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
  await asyncLoop(
    (ps1 > ps2 ? ps1 : ps2) - times,
    (ps1 > ps2 ? ps1 : ps2) + times,
    1,
    async i => {
      if (i < 0 || i > 511) return;
      grid.push([]);
      const index = grid.length - 1;
      await telnet.write(`mp 1 ${ps1 > ps2 ? 1 : 2} ${i} `);
      await asyncLoop(
        pd - times,
        pd + times,
        1,
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
          grid[index][grid[index].length - 1].push(data + (10 - Math.abs(power)));
        },
        [skip, pd]
      );
    },
    [skip, ps1 || ps2]
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
  const { amp, phase, ps1, ps2, pd } = await applyTable('fine', usingTable);
  const lowest = await getGrid(frequency, power, degrees, amp, phase, ps1, ps2, pd);
  return lowest;
};
