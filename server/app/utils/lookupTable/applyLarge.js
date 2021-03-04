const telnet = require('../telnet');
const { readLargeTable } = require('../csv');

module.exports = async (ampStep = 1, phaseStep = 10) => {
  const { frequency, amp, phase } = await telnet.parseGlobalStat();
  const row =
    Math.round((amp > 2010 ? 2010 : amp) / ampStep) * (6420 / phaseStep + 1) +
    Math.round((phase > 6420 ? 6420 : phase) / phaseStep);
  const { ps1, ps2, pd } = await readLargeTable(frequency, row);
  await telnet.write(`mp 1 1 ${ps1} `);
  await telnet.write(`mp 1 2 ${ps2} `);
  await telnet.write(`mp 1 3 ${pd} `);
  return { amp, phase, ps1, ps2, pd };
};
