const optimizePoint = require('./optimizePoint');
const optimizePointTimer = require('./optimizePointTimer');
const { setAnalyzer, resetAnalyzer } = require('../cpp');
const { asyncLoop } = require('../math');
const { ms, clock, clockStart, clockPrint } = require('../time');
const { storeOptimize, concatCsv } = require('../csv');

const timer = false;

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
  // let previousPowerPoint = [];

  await asyncLoop(ampLow, ampHigh, 0.5, async i => {
    let point = [];
    // let collectPreviousPowerPoint = true;
    const newPower = false;

    if (timer) {
      clockStart();
    }

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

      if (timer) {
        point = await optimizePointTimer(frequency, i, j, point, Stage, newPower);
      } else {
        point = await optimizePoint(frequency, i, j, point, Stage, newPower);
      }

      // if (collectPreviousPowerPoint) {
      //   collectPreviousPowerPoint = false;
      //   newPower = false;
      //   previousPowerPoint = point;
      // }

      await storeOptimize([point], frequency, i, j);
    });

    if (timer) {
      clock('code');
      clockPrint();
    }
  });
  await ms(1000);
  await concatCsv();
  await resetAnalyzer();
};
