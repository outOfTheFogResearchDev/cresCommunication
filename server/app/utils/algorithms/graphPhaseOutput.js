const telnet = require('../telnet');
const moku = require('../moku');
const { storePhaseGraph } = require('../csv');
const { asyncLoop } = require('../math');
const { ms } = require('../time');

module.exports = async freq => {
  await telnet.setFreq(freq);

  await telnet.write(`mp 0 1 0 `);
  await telnet.write(`mp 0 2 0 `);
  await telnet.write(`mp 0 3 0 `);
  await telnet.write(`ac1 1`);
  await telnet.write(`pc1 1`);

  const data = [];

  await asyncLoop(0, 359, 1, async degrees => {
    console.log(`GlobalStat for ${degrees} degrees on frequency ${freq}MHz.`); // eslint-disable-line no-console
    await moku.setPoint(freq, 0, degrees);
    await ms(250);
    const { frequency, phase1, phase2, phase } = await telnet.parseGlobalStat();
    data.push([degrees, frequency, phase1, phase2, phase]);
  });

  await storePhaseGraph(data, freq);
};

module.exports.runAll = async () => {
  await asyncLoop(105, 195, 5, async freq => {
    await module.exports(freq);
  });
};
