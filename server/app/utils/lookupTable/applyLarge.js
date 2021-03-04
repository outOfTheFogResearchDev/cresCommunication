const telnet = require('../telnet');
const { readLargeTable } = require('../csv');

module.exports = async (ampStep = 10, phaseStep = 30) => {
  const { frequency, amp, phase } = await telnet.parseGlobalStat();
  let _amp = amp > 2010 ? 2010 : amp;
  _amp = amp < 960 ? 960 : amp;
  const _phase = phase > 6420 ? 6420 : phase;
  const row = Math.round((_amp - 960) / ampStep) * (6420 / phaseStep + 1) + Math.round(_phase / phaseStep);
  const { ps1, ps2, pd } = await readLargeTable(frequency, row);
  await telnet.write(`mp 1 1 ${ps1} `);
  await telnet.write(`mp 1 2 ${ps2} `);
  await telnet.write(`mp 1 3 ${pd} `);
  return { amp, phase, ps1, ps2, pd };
};
