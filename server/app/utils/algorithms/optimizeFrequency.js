const optimizePoint = require('./optimizePoint');
const telnet = require('../telnet');
const { setAnalyzer, resetAnalyzer } = require('../cpp');
const { asyncLoop } = require('../math');
const { ms } = require('../time');
const { storeOptimize, concatCsv } = require('../csv');

module.exports = async frequency => {
  await setAnalyzer(frequency);
  await telnet.write(`ac1 1`);
  await telnet.write(`pc1 1`);
  const points = [];
  await asyncLoop(2, 5, 20 / 20, async i => {
    await asyncLoop(-180, 180, 360 / 40, async j => {
      const point = await optimizePoint(frequency, i, j);
      points.push(point);
      await storeOptimize([point], frequency, i, j);
    });
  });
  await ms(1000);
  await concatCsv();
  await resetAnalyzer();
  return points;
};
