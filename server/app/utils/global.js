let frequency;

module.exports = {
  setFrequency: freq => {
    frequency = +freq;
  },
  getFrequency: () => frequency,
  getTableFrequency: () => {
    let temp = Math.floor((frequency - 97.5) / 5);
    if (temp < 0) temp = 0;
    if (temp > 20) temp = 20;
    return temp * 5 + 100;
  },
  mHZEdgeOffset: freq => {
    if (freq === 100) {
      // return 101.25;
    }
    if (freq === 200) {
      // return 198.75;
    }
    return freq;
  },
};
