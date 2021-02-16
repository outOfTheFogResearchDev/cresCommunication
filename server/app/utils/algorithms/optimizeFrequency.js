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
  const Stage = {
    value: -1,
    next() {
      this.value = (this.value + 1) % 3;
    },
    setValue(val) {
      this.value = val;
    },
    isPs1() {
      return !!(this.value % 2);
    },
    isPs2() {
      return !(this.value % 2);
    },
    isNearBaseCase(point) {
      return (
        (this.value === -1 && point[5] <= 5) ||
        (this.value === 0 && point[6] >= point[5] - 5) ||
        (this.value === 1 && point[5] <= 5) ||
        (this.value === 2 && point[6] >= 506)
      );
    },
  };
  await asyncLoop(ampLow, ampHigh, 0.5, async i => {
    let point = [];
    let collectPreviousPowerPoint = true;
    await asyncLoop(phaseLow, phaseHigh, 5, async j => {
      let newPower = false;

      if (previousPowerPoint.length) {
        point = previousPowerPoint;
        previousPowerPoint = [];
        newPower = true;
        if (point[6] === 511) {
          Stage.setValue(-1);
        } else if (point[6] < point[5]) {
          Stage.setValue(0);
        } else if (point[6] >= point[5] && point[5] !== 0) {
          Stage.setValue(1);
        } else if (point[5] === 0) {
          Stage.setValue(2);
        }
      }

      point = await optimizePoint(frequency, i, j, point, Stage, newPower);

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
