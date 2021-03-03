const telnet = require('../telnet');
const { readTable } = require('../csv');

/**
 * type = coarse
 * type = fine
 */
module.exports = async (type, usingTable, prevAmp, prevPhase) => {
  const { frequency, amp, phase } = await telnet.parseGlobalStat();
  if (prevAmp && prevPhase && Math.abs(amp - prevAmp) < 3 && Math.abs(phase - prevPhase) < 3) {
    return { amp: prevAmp, phase: prevPhase };
  }
  const table = await readTable(
    `${__dirname}/${process.env.TYPE === 'exe' ? 'tools/grid' : 'local'}/${
      frequency === usingTable ? 'temp/fixed.csv' : `${usingTable || frequency}_MHz.csv`
    }`
  );
  let closest = [];
  let closestDistance = 0;
  table.forEach(cell => {
    const d1 = Math.sqrt(((amp - +cell[3]) * 3.2) ** 2 + (phase - +cell[4]) ** 2);
    const d2 = phase < 200 ? Math.sqrt(((amp - +cell[3]) * 3.2) ** 2 + (phase + 6420 - +cell[4]) ** 2) : d1;
    const d3 = phase > 6200 ? Math.sqrt(((amp - +cell[3]) * 3.2) ** 2 + (phase - 6420 - +cell[4]) ** 2) : d1;
    const distance = Math.min(d1, d2, d3);
    if (!closest.length || distance < closestDistance) {
      closest = cell;
      closestDistance = distance;
    }
  });
  closest = closest.map(item => +item);
  const [, , , , , ps1, ps2, pd] = closest;
  return { amp, phase, ps1, ps2, pd };
};
