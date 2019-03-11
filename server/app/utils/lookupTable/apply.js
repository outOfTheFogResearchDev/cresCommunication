const telnet = require('../telnet');
const { readTable } = require('../csv');

const parseGlobalStat = async () => {
  const globalStat = await telnet.write('GlobalStat');
  let index = globalStat.indexOf('Frequency:');
  const frequency = +globalStat.substring(index + 11, index + 14);
  index = globalStat.indexOf('Amplitude:', index + 14);
  const amp = +globalStat.substring(index + 12, index + 16);
  index = globalStat.indexOf('360 Phase:', index + 16);
  const phase = +globalStat.substring(index + 12, index + 16);
  return { frequency, amp, phase };
};

module.exports = async () => {
  const { frequency, amp, phase } = await parseGlobalStat();
  const table = await readTable(`${__dirname}/local/${frequency}_MHz.csv`);
  let closest = [];
  let closestDistance = 0;
  table.forEach(cell => {
    const distance = Math.sqrt(Math.abs((amp - cell[3]) ** 2 + (phase - cell[4]) ** 2));
    if (!closest.length || distance < closestDistance) {
      closest = cell;
      closestDistance = distance;
    }
  });
  //   otherCornerPower = closest[1] + (amp - closest[3] ? 1 : -1);
  //   otherCornerDegree = closest[2] + (phase - closest[4] ? 9 : -9);
  //   const otherCorner = table.find(([,power,degree]) => power === otherCornerPower && degree === otherCornerDegree)
  //   const ps1 = (1 - d1 / (d1 + d2)) * v1 + (1 - d2 / (d1 + d2)) * v2
  //   const ps2 =
  //   const pd =
  await telnet.write(`mp 1 1 ${closest[5]} `);
  await telnet.write(`mp 1 2 ${closest[6]} `);
  await telnet.write(`mp 1 3 ${closest[7]} `);
};
