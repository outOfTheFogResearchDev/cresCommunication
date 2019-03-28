const { Router } = require('express');
const telnet = require('../utils/telnet');
const { storePoints } = require('../utils/csv');
const { ms } = require('../utils/time');
const applyTable = require('../utils/lookupTable/apply');
const { inOperation, outOperation, getOperating } = require('../ping/index');

let getPower;
let setAnalyzer;
let resetAnalyzer;
let moku;
let genRandomPoints;
let optimizeFrequency;
if (process.env.TYPE !== 'exe') {
  ({ getPower, setAnalyzer, resetAnalyzer } = require('../utils/cpp'));
  moku = require('../utils/moku');
  genRandomPoints = require('../utils/algorithms/genRandomPoints');
  optimizeFrequency = require('../utils/algorithms/optimizeFrequency');
}

const api = Router();

api.post('/connect', async (req, res) => {
  if (getOperating()) {
    res.sendStatus(200);
    return;
  }
  inOperation();
  console.log('connecting'); // eslint-disable-line no-console
  if (process.env.TYPE !== 'exe' && !moku.connected) {
    await moku.connect();
    console.log('moku'); // eslint-disable-line no-console
  }
  if (!telnet.connected) {
    await telnet.connect();
    console.log('telnet'); // eslint-disable-line no-console
  }
  outOperation();
  res.sendStatus(201);
});

api.get('/command', async (req, res) => {
  const { command } = req.query;
  const response = await telnet.write(`${command} `);
  res.status(200).send({ response });
});

if (process.env.TYPE !== 'exe') {
  /**
   * type = auto
   * type = table
   */
  api.get('/gen_points/:type', async (req, res) => {
    const {
      freqLow,
      freqHigh,
      ampLow,
      ampHigh,
      phaseLow,
      phaseHigh,
      pointsQuantity,
      type: tableType,
      fails,
    } = req.query;
    const { type } = req.params;
    if (getOperating()) {
      res.status(200).send({ points: [] });
      return;
    }
    inOperation();
    await setAnalyzer(150);
    if (type === 'auto') {
      await telnet.write(`mp 0 1 0 `);
      await telnet.write(`mp 0 2 0 `);
      await telnet.write(`mp 0 3 0 `);
      await telnet.write(`ac1 1`);
      await telnet.write(`pc1 1`);
    }
    const points = await genRandomPoints(
      +freqLow,
      +freqHigh,
      +ampLow,
      +ampHigh,
      +phaseLow,
      +phaseHigh,
      +pointsQuantity,
      type,
      tableType,
      fails
    );
    await resetAnalyzer();
    await storePoints(points);
    outOperation();
    res.status(200).send({ response: 'done' });
  });

  api.get('/gen', async (req, res) => {
    const { frequency, amplitude, phase } = req.query;
    if (getOperating()) {
      res.status(200).send({ points: [] });
      return;
    }
    inOperation();
    await setAnalyzer(+frequency);
    await moku.setPoint(+frequency, +amplitude, +phase);
    if (+frequency < 142.5 || +frequency > 157.4) {
      await telnet.write(`mp 0 1 0 `);
      await telnet.write(`mp 0 2 0 `);
      await telnet.write(`mp 0 3 0 `);
      await telnet.write(`ac1 1`);
      await telnet.write(`pc1 1`);
    } else {
      await ms(10);
      await applyTable('fine');
    }
    await ms(10);
    const power = await getPower();
    await resetAnalyzer();
    outOperation();
    res.status(200).send({ point: [frequency, amplitude, phase, power, power + (10 - Math.abs(amplitude))] });
  });

  api.get('/optimizeFrequency', async (req, res) => {
    const { frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable } = req.query;
    if (getOperating()) {
      res.status(200).send({ points: [] });
      return;
    }
    inOperation();
    await optimizeFrequency(+frequency, +ampLow, +ampHigh, +phaseLow, +phaseHigh, +usingTable || usingTable);
    outOperation();
    res.status(200).send({ response: 'done' });
  });
}

module.exports = api;
