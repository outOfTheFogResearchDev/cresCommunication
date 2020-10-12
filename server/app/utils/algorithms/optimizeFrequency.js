const optimizePoint = require('./optimizePoint');
const telnet = require('../telnet');
const { setAnalyzer, resetAnalyzer } = require('../cpp');
const { asyncLoop } = require('../math');
const { ms } = require('../time');
const { storeOptimize, concatCsv } = require('../csv');

module.exports = async (frequency, ampLow, ampHigh, phaseLow, phaseHigh) => {
  await setAnalyzer(frequency);
  await telnet.write(`ac1 1`);
  await telnet.write(`pc1 1`);
  await asyncLoop(ampLow, ampHigh, 20 / 40, async i => {
    let point = [];
    await asyncLoop(phaseLow, phaseHigh, 360 / 80, async j => {
      if (point.length) {
        point = await optimizePoint(frequency, i, j, point);
        if (point[9] > -30) {
          point = await optimizePoint(frequency, i, j);
        }
      } else {
        point = await optimizePoint(frequency, i, j);
      }
      await storeOptimize([point], frequency, i, j);
    });
  });
  await ms(1000);
  await concatCsv();
  await resetAnalyzer();
};
