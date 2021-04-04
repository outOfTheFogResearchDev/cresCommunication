let frequency;

module.exports = {
  setFrequency: freq => {
    frequency = +freq;
  },
  getFrequency: () => frequency,
  getTableFrequency: () => {
    let temp = Math.floor((frequency - 102.5) / 5);
    if (temp < 0) temp = 0;
    if (temp > 20) temp = 20;
    return temp * 5 + 100;
  },
};
