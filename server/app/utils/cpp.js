const bindings = require('bindings'); // eslint-disable-line import/no-extraneous-dependencies
const { mHZEdgeOffset } = require('./global');

const gp = bindings('getPower');
const sa = bindings('setAnalyzer');

module.exports = {
  getPower: async () => {
    let data = await gp();

    data = data.split('E');
    const num = +data[0];
    const e = +data[1].split('\n')[0];

    const power = num * 10 ** e;

    return Math.round(power * 10) / 10;
  },
  resetAnalyzer: bindings('resetAnalyzer'),
  setAnalyzer: async (freq, creatingTable) => {
    let frequency = freq;
    if (creatingTable) {
      frequency = mHZEdgeOffset(frequency);
    }
    return sa(frequency);
  },
  setCenter: bindings('setCenter'),
};
