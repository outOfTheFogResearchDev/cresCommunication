const telnet = require('../telnet');
const { readLargeTable } = require('../csv');

module.exports = async () => {
  const { frequency, amp, phase } = await telnet.parseGlobalStat();
  const row = (amp > 2010 ? 2010 : amp) * 643 + Math.round((phase > 6420 ? 6420 : phase) / 10);
  return readLargeTable(frequency, row);
};
