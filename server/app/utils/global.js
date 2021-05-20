let frequency;

module.exports = {
  setFrequency: freq => {
    frequency = +freq;
  },
  getFrequency: () => frequency,
  getTableFrequency: () => {
    let temp = Math.floor((frequency - 98.75) / 2.5);
    if (temp < 0) temp = 0;
    if (temp > 40) temp = 40;
    return temp * 2.5 + 100;
    // let temp = Math.floor((frequency - 97.5) / 5);
    // if (temp < 0) temp = 0;
    // if (temp > 20) temp = 20;
    // return temp * 5 + 100;
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
