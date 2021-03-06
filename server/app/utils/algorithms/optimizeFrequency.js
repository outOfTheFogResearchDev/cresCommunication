const optimizePoint = require('./optimizePoint');
const telnet = require('../telnet');
const { setAnalyzer, resetAnalyzer } = require('../cpp');
const { asyncLoop } = require('../math');
const { ms } = require('../time');
const { storeOptimize, concatCsv } = require('../csv');

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

module.exports = async (frequency, ampLow, ampHigh, phaseLow, phaseHigh) => {
  Stage.setValue(-1);
  await setAnalyzer(frequency, true);
  await telnet.write(`ac1 1`);
  await telnet.write(`pc1 1`);
  // let previousPowerPoint = [];

  await asyncLoop(ampLow, ampHigh, 0.5, async i => {
    let point = [];
    // let collectPreviousPowerPoint = true;
    const newPower = false;
    await asyncLoop(phaseLow, phaseHigh, 5, async j => {
      // if (newPower && previousPowerPoint.length) {
      //   point = previousPowerPoint;
      //   previousPowerPoint = [];
      //   point[7] += 10;
      //   if (point[6] === 511) {
      //     Stage.setValue(-1);
      //   } else if (point[6] < point[5]) {
      //     Stage.setValue(0);
      //   } else if (point[6] >= point[5] && point[5] !== 0) {
      //     Stage.setValue(1);
      //   } else if (point[5] === 0) {
      //     Stage.setValue(2);
      //   }
      // }

      point = await optimizePoint(frequency, i, j, point, Stage, newPower);

      if (point[9] > -33) {
        point = await optimizePoint(frequency, i, j, [], Stage, newPower, point[5] > point[6] ? point[5] : 0);
      }

      // if (collectPreviousPowerPoint) {
      //   collectPreviousPowerPoint = false;
      //   newPower = false;
      //   previousPowerPoint = point;
      // }

      await storeOptimize([point], frequency, i, j);
    });
  });
  await ms(1000);
  await concatCsv();
  await resetAnalyzer();
};
