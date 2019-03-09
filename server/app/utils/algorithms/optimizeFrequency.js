const optimizePoint = require('./optimizePoint');
const { setAnalyzer, resetAnalyzer } = require('../cpp');
const { asyncLoop } = require('../math');
const { storeOptimize } = require('../csv'); //!

module.exports = async (frequency, gridFineness) => {
  await setAnalyzer(frequency);
  const points = [];
  await asyncLoop(-10, 10, 20 / gridFineness, async i => {
    await asyncLoop(-180, 180, 360 / gridFineness, async j => {
      const point = await optimizePoint(frequency, i, j);
      points.push(point);
      await storeOptimize([point], frequency, i, j); //!
      await storeOptimize(points, frequency); //!
    });
  });
  await resetAnalyzer();
  return points;
};
