let previousMs = 0;
const data = {
  code: { totalTime: 0, quantity: 0, averageTime: 0 },
  telnet: { totalTime: 0, quantity: 0, averageTime: 0 },
  moku: { totalTime: 0, quantity: 0, averageTime: 0 },
  analyzer: { totalTime: 0, quantity: 0, averageTime: 0 },
};

module.exports = {
  ms: ms => new Promise(resolve => setTimeout(resolve, ms)),
  clock: type => {
    data[type].totalTime += Date.now() - previousMs;
    data[type].quantity += 1;
    previousMs = Date.now();
  },
  clockStart: () => {
    previousMs = Date.now();
  },
  clockPrint: () => {
    Object.entries(data).forEach(([type, values]) => {
      data[type].averageTime = values.totalTime / values.quantity;
    });
    console.log(data); // eslint-disable-line no-console
    Object.entries(data).forEach(([type, values]) => {
      Object.entries(values).forEach(([value]) => {
        data[type][value] = 0;
      });
    });
  },
};
