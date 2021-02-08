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
  let previousPowerPoint = [];
  await asyncLoop(ampLow, ampHigh, 20 / 40, async i => {
    let point = [];
    let collectPreviousPowerPoint = true;
    await asyncLoop(phaseLow, phaseHigh, 360 / 80, async j => {
      let newPower = false;

      if (previousPowerPoint.length) {
        point = previousPowerPoint;
        previousPowerPoint = [];
        newPower = true;
      }

      point = await optimizePoint(frequency, i, j, point, newPower);

      if (collectPreviousPowerPoint) {
        collectPreviousPowerPoint = false;
        previousPowerPoint = point;
      }

      await storeOptimize([point], frequency, i, j);
    });
  });
  await ms(1000);
  await concatCsv();
  await resetAnalyzer();
};
