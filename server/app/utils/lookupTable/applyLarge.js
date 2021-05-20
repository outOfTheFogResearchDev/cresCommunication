const telnet = require('../telnet');
const { readLargeTable } = require('../csv');
const { getTableFrequency } = require('../global');

module.exports = async (ampStep = 10, phaseStep = 30) => {
  const { amp, phase } = await telnet.getAmpPhaseCodes();
  const frequency = getTableFrequency();
  let _amp = amp > 2150 ? 2150 : amp;
  _amp = amp < 850 ? 850 : amp;
  const _phase = phase > 6600 ? 6600 : phase;
  const row = Math.round((_amp - 900) / ampStep) * (6600 / phaseStep + 1) + Math.round(_phase / phaseStep);
  const { ps1, ps2, pd } = await readLargeTable(frequency, row);
  await telnet.write(`mp3 1 ${ps1} ${ps2} ${pd} `);
  return { amp, phase, ps1, ps2, pd };
};
