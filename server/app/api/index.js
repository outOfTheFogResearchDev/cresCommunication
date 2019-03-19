const { Router } = require('express');
const moku = require('../utils/moku');
const telnet = require('../utils/telnet');
const genRandomPoints = require('../utils/algorithms/genRandomPoints');
const optimizeFrequency = require('../utils/algorithms/optimizeFrequency');
const { getPower, setAnalyzer, resetAnalyzer } = require('../utils/cpp');
const { storePoints } = require('../utils/csv');
const { ms } = require('../utils/time');
const applyTable = require('../utils/lookupTable/apply');

const api = Router();

api.post('/connect', async (req, res) => {
  if (+process.env.inOperation) {
    res.sendStatus(200);
    return;
  }
  process.env.inOperation = 1;
  console.log('connecting');
  if (!moku.connected) await moku.connect();
  console.log('moku');
  if (!telnet.connected) await telnet.connect();
  console.log('telnet');
  process.env.inOperation = 0;
  res.sendStatus(201);
});

api.get('/command', async (req, res) => {
  const { command } = req.query;
  const response = await telnet.write(`${command} `);
  res.status(200).send({ response });
});

/**
 * type = auto
 * type = table
 */
api.get('/gen_points/:type', async (req, res) => {
  const { freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity, type: tableType, fails } = req.query;
  const { type } = req.params;
  if (+process.env.inOperation) {
    res.status(200).send({ points: [] });
    return;
  }
  process.env.inOperation = 1;
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
  process.env.inOperation = 0;
  res.status(200).send({ points });
});

api.get('/gen', async (req, res) => {
  const { frequency, amplitude, phase } = req.query;
  if (+process.env.inOperation) {
    res.status(200).send({ points: [] });
    return;
  }
  process.env.inOperation = 1;
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
  process.env.inOperation = 0;
  res.status(200).send({ point: [frequency, amplitude, phase, power, power + (10 - Math.abs(amplitude))] });
});

api.get('/optimizeFrequency', async (req, res) => {
  const { frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable } = req.query;
  if (+process.env.inOperation) {
    res.status(200).send({ points: [] });
    return;
  }
  process.env.inOperation = 1;
  const points = await optimizeFrequency(+frequency, +ampLow, +ampHigh, +phaseLow, +phaseHigh, +usingTable);
  process.env.inOperation = 0;
  res.status(200).send({ points });
});

module.exports = api;
