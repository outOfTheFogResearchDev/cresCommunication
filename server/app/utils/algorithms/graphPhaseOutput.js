const telnet = require('../telnet');
const moku = require('../moku');
const { storePhaseGraph } = require('../csv');
const { asyncLoop } = require('../math');
const { ms } = require('../time');

// ! Only use this module by itself, seperate from the server

module.exports = async freq => {
  if (!moku.connected) {
    await moku.connect();
    console.log('moku'); // eslint-disable-line no-console
  }
  if (!telnet.connected) {
    await telnet.connect();
    console.log('telnet'); // eslint-disable-line no-console
  }

  await telnet.write(`mp 0 1 0 `);
  await telnet.write(`mp 0 2 0 `);
  await telnet.write(`mp 0 3 0 `);
  await telnet.write(`ac1 1`);
  await telnet.write(`pc1 1`);

  const data = [];

  await asyncLoop(0, 359, 1, async degrees => {
    await moku.setPoint(freq, 0, degrees);
    await ms(10);
    const { frequency, phase1, phase2, phase } = await telnet.parseGlobalStat();
    data.push([degrees, frequency, phase1, phase2, phase]);
  });

  await storePhaseGraph(data, freq);
};
