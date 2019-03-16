const telnet = require('../telnet');
const { readTable } = require('../csv');

/**
 * type = coarse
 * type = fine
 */
module.exports = async (type, usingTable) => {
  const { frequency, amp, phase } = await telnet.parseGlobalStat();
  const table = await readTable(`${__dirname}/local/${usingTable || frequency}_MHz.csv`);
  let closest = [];
  let closestDistance = 0;
  table.forEach(cell => {
    const d1 = Math.sqrt(Math.abs((amp - +cell[3]) ** 2 + (phase - +cell[4]) ** 2));
    const d2 = phase < 300 ? Math.sqrt(Math.abs((amp - +cell[3]) ** 2 + (phase + 6450 - +cell[4]) ** 2)) : d1;
    const d3 = phase > 6100 ? Math.sqrt(Math.abs((amp - +cell[3]) ** 2 + (phase - 6450 - +cell[4]) ** 2)) : d1;
    const distance = Math.min(d1, d2, d3);
    if (!closest.length || distance < closestDistance) {
      closest = cell;
      closestDistance = distance;
    }
  });
  closest = closest.map(item => +item);
  let ps1;
  let ps2;
  let pd;
  const powerShift = type === 'fine' ? 0.5 : 1;
  const degreeShift = type === 'fine' ? 4.5 : 9;
  const otherCornerPower = closest[1] + (amp - closest[3] > 0 ? powerShift : -1 * powerShift);
  const otherCornerDegree = closest[2] + (phase - closest[4] > 0 ? degreeShift : -1 * degreeShift);
  if (
    otherCornerDegree > 180 ||
    otherCornerDegree < -180 ||
    otherCornerPower > 10 ||
    otherCornerPower < -10 ||
    phase < 250 ||
    phase > 6200
  ) {
    [, , , , , ps1, ps2, pd] = closest;
  } else {
    const otherCorner = table
      .find(([, power, degree]) => +power === otherCornerPower && +degree === otherCornerDegree)
      .map(item => +item);
    if (Math.abs(closest[4] - otherCorner[4]) > 1000) {
      if (closest[4] > otherCorner[4]) closest[4] -= 6450;
      else otherCorner[4] -= 6450;
    }
    if (
      (closest[5] === 0 && otherCorner[5] !== 0) ||
      (otherCorner[5] === 0 && closest[5] !== 0) ||
      (closest[6] === 0 && otherCorner[6] !== 0) ||
      (otherCorner[6] === 0 && closest[6] !== 0)
    ) {
      [, , , , , ps1, ps2, pd] = closest;
    } else {
      ps1 = Math.round(
        (1 - Math.abs(closest[4] - phase) / Math.abs(closest[4] - otherCorner[4])) * closest[5] +
          (1 - Math.abs(otherCorner[4] - phase) / Math.abs(closest[4] - otherCorner[4])) * otherCorner[5]
      );
      ps2 = Math.round(
        (1 - Math.abs(closest[4] - phase) / Math.abs(closest[4] - otherCorner[4])) * closest[6] +
          (1 - Math.abs(otherCorner[4] - phase) / Math.abs(closest[4] - otherCorner[4])) * otherCorner[6]
      );
      pd = Math.round(
        (1 - Math.abs(closest[3] - amp) / Math.abs(closest[3] - otherCorner[3])) * closest[7] +
          (1 - Math.abs(otherCorner[3] - amp) / Math.abs(closest[3] - otherCorner[3])) * otherCorner[7]
      );
      if ((pd < closest[7] && pd < otherCorner[7]) || (pd > closest[7] && pd > otherCorner[7])) {
        pd = (closest[7] + otherCorner[7]) / 2;
      }
    }
  }
  await telnet.write(`mp 1 1 ${ps1} `);
  await telnet.write(`mp 1 2 ${ps2} `);
  await telnet.write(`mp 1 3 ${pd} `);
  return { amp, phase, ps1, ps2, pd };
};
