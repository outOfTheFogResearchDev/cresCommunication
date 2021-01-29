const moku = require('../moku');
const telnet = require('../telnet');
const { getPower } = require('../cpp');
const { ms } = require('../time');
const { asyncLoop, twoDMin } = require('../math');

const getGrid = async (frequency, power, degrees, amp, phase, ps1, fresh, iteration = 0, prevLowest, newPower) => {
  const grid = [];
  let psStart;
  let psStop;
  let pdStart;
  let pdStop;
  let psStep;
  let pdStep;
  if (fresh) {
    if (iteration === 0) {
      psStart = 25;
      psStop = 475;
      pdStart = 25;
      pdStop = 475;
      psStep = 50;
      pdStep = 50;
    } else if (iteration === 1) {
      psStart = prevLowest[ps1 ? 5 : 6] - 35;
      psStop = prevLowest[ps1 ? 5 : 6] + 35;
      pdStart = prevLowest[7] - 35;
      pdStop = prevLowest[7] + 35;
      psStep = 5;
      pdStep = 2;
    } else if (iteration === 2) {
      psStart = prevLowest[ps1 ? 5 : 6] - 3;
      psStop = prevLowest[ps1 ? 5 : 6] + 3;
      pdStart = prevLowest[7] - 3;
      pdStop = prevLowest[7] + 3;
      psStep = 1;
      pdStep = 1;
    }
  } else if (!fresh) {
    if (iteration === 0) {
      // must have come from a flip
      psStart = 16;
      psStop = 491;
      pdStart = prevLowest[7]; // eslint-disable-line prefer-destructuring
      pdStop = prevLowest[7]; // eslint-disable-line prefer-destructuring
      psStep = 25;
      pdStep = 1;
    } else if (iteration === 1 && newPower) {
      psStart = prevLowest[ps1 ? 5 : 6] - 4;
      psStop = prevLowest[ps1 ? 5 : 6] + 4;
      pdStart = prevLowest[7] - 12;
      pdStop = prevLowest[7] + 12;
      psStep = 2;
      pdStep = 3;
    } else if (iteration === 1 && !newPower) {
      psStart = ps1 ? prevLowest[5] - 16 : prevLowest[6];
      psStop = ps1 ? prevLowest[5] : prevLowest[6] + 16;
      pdStart = prevLowest[7] - 4;
      pdStop = prevLowest[7] + 4;
      psStep = 4;
      pdStep = 2;
    } else if (iteration === 2) {
      psStart = prevLowest[ps1 ? 5 : 6] - 2;
      psStop = prevLowest[ps1 ? 5 : 6] + 2;
      pdStart = prevLowest[7] - 2;
      pdStop = prevLowest[7] + 2;
      psStep = 1;
      pdStep = 1;
    }
  }

  await asyncLoop(psStart, psStop, psStep, async step => {
    let i = step;
    if (i < 0) i += 512;
    if (i > 511) i -= 512;
    grid.push([]);
    const index = grid.length - 1;
    await telnet.write(`mp 1 ${ps1 ? 1 : 2} ${i} `);
    return asyncLoop(pdStart, pdStop, pdStep, async innerStep => {
      let j = innerStep;
      if (j < 0) j += 512;
      if (j > 511) j -= 512;
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
          try {
            console.log('getPower 2 failed'); // eslint-disable-line no-console
            await ms(60000);
            data = await getPower();
          } catch (err) {
            console.log('getPower 3 failed'); // eslint-disable-line no-console
            data = 0;
          }
        }
      }
      grid[index][grid[index].length - 1].push(data);
      const correctedValue = data + (10 - Math.abs(power));
      grid[index][grid[index].length - 1].push(correctedValue);
      return null;
    });
  });
  const lowest = twoDMin(grid, 9);
  if (!fresh && iteration === 0 && !newPower) {
    const firstHalf = await getGrid(frequency, power, degrees, amp, phase, ps1, fresh, iteration + 1, lowest);
    lowest[5] += ps1 ? 16 : 0;
    lowest[6] -= ps1 ? 0 : 16;
    const secondHalf = await getGrid(frequency, power, degrees, amp, phase, ps1, fresh, iteration + 1, lowest);
    return firstHalf[9] < secondHalf[9] ? firstHalf : secondHalf;
  }
  return iteration === 2 ? lowest : getGrid(frequency, power, degrees, amp, phase, ps1, fresh, iteration + 1, lowest);
};

module.exports = async (frequency, power, degrees, prevPoint, newPower) => {
  console.log(power, degrees); // eslint-disable-line no-console
  await moku.setPoint(frequency, power, degrees);
  await ms(250);
  const { amp, phase } = await telnet.parseGlobalStat();
  const ps1 = prevPoint[5] || 0;
  const ps2 = prevPoint[6] || 1;
  await telnet.write(`mp 1 ${ps1 > ps2 ? 2 : 1} 0 `);
  let point = await (prevPoint.length
    ? getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, false, 1, prevPoint, newPower)
    : getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, true));
  if ((point[6] === 127 || point[6] === 255 || point[6] === 511) && prevPoint.length) {
    const newPrevPoint = prevPoint;
    newPrevPoint[6] = prevPoint[6] + (point[6] === 127 ? 8 : 16);
    newPrevPoint[7] = prevPoint[7] + (point[6] === 127 ? 3 : 5);
    let checkPoint = await getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, false, 1, newPrevPoint, newPower);
    point = point[9] < checkPoint[9] ? point : checkPoint;

    newPrevPoint[6] = prevPoint[6] + (point[6] === 127 ? 16 : 32);
    newPrevPoint[7] = prevPoint[7] + (point[6] === 127 ? 5 : 10);
    checkPoint = await getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, false, 1, newPrevPoint, newPower);
    point = point[9] < checkPoint[9] ? point : checkPoint;
  }
  if ((point[5] === 128 || point[5] === 256 || point[5] === 512) && prevPoint.length) {
    const newPrevPoint = prevPoint;
    newPrevPoint[5] = prevPoint[5] - (point[5] === 128 ? 8 : 16);
    newPrevPoint[7] = prevPoint[7] + (point[5] === 128 ? 3 : 5);
    let checkPoint = await getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, false, 1, newPrevPoint, newPower);
    point = point[9] < checkPoint[9] ? point : checkPoint;

    newPrevPoint[5] = prevPoint[5] - (point[5] === 128 ? 16 : 32);
    newPrevPoint[7] = prevPoint[7] + (point[5] === 128 ? 5 : 10);
    checkPoint = await getGrid(frequency, power, degrees, amp, phase, ps1 > ps2, false, 1, newPrevPoint, newPower);
    point = point[9] < checkPoint[9] ? point : checkPoint;
  }
  if (point[9] > -35) {
    console.log('trying flip'); // eslint-disable-line no-console
    await telnet.write(`mp 1 ${ps2 > ps1 ? 2 : 1} 0 `);
    const flipPoint = await (prevPoint.length
      ? getGrid(frequency, power, degrees, amp, phase, ps2 > ps1, false, 0, prevPoint, newPower)
      : getGrid(frequency, power, degrees, amp, phase, ps2 > ps1, true));
    return point[9] < flipPoint[9] ? point : flipPoint;
  }
  return point;
};
