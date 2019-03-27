const optimizePoint = require('./optimizePoint');
const telnet = require('../telnet');
const { setAnalyzer, resetAnalyzer } = require('../cpp');
const { asyncLoop } = require('../math');
const { ms } = require('../time');
const { storeOptimize, concatCsv } = require('../csv');
const offPointReset = require('./tools/offPointReset');
const clearTemp = require('./tools/clearTemp');

module.exports = async (frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable) => {
  if (frequency === usingTable) await offPointReset(frequency);
  await setAnalyzer(frequency);
  await telnet.write(`ac1 1`);
  await telnet.write(`pc1 1`);
  await asyncLoop(ampLow, ampHigh, 20 / 40, async i => {
    await asyncLoop(phaseLow, phaseHigh, 360 / 80, async j => {
      const point = await optimizePoint(frequency, i, j, usingTable);
      await storeOptimize([point], frequency, i, j);
    });
  });
  await ms(1000);
  await concatCsv();
  await resetAnalyzer();
  if (frequency === usingTable) await clearTemp();
};
