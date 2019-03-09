const { Router } = require('express');
const moku = require('../utils/moku');
const telnet = require('../utils/telnet');
const genRandomPoints = require('../utils/algorithms/genRandomPoints');
const optimizeFrequency = require('../utils/algorithms/optimizeFrequency');
const { getPower, setAnalyzer, resetAnalyzer } = require('../utils/cpp');
const { storePoints, storeOptimize } = require('../utils/csv');
const { ms } = require('../utils/time');

const api = Router();

api.post('/connect', async (req, res) => {
  if (!moku.connected) await moku.connect();
  if (!telnet.connected) await telnet.connect();
  res.sendStatus(201);
});

api.get('/gen_points', async (req, res) => {
  const { freqLow, freqHigh, pointsQuantity } = req.query;
  process.env.inOperation = 1;
  await setAnalyzer(150);
  await telnet.write(`mp 0 1 0 `);
  await telnet.write(`mp 0 2 0 `);
  await telnet.write(`mp 0 3 0 `);
  const points = await genRandomPoints(+freqLow, +freqHigh, +pointsQuantity);
  await resetAnalyzer();
  await storePoints(points);
  process.env.inOperation = 0;
  res.status(200).send({ points });
});

api.get('/gen', async (req, res) => {
  const { frequency, amplitude, phase } = req.query;
  process.env.inOperation = 1;
  await setAnalyzer(+frequency);
  await moku.setPoint(+frequency, +amplitude, +phase);
  await ms(10);
  const power = await getPower();
  await resetAnalyzer();
  process.env.inOperation = 0;
  res.status(200).send({ point: [frequency, amplitude, phase, power, power + (10 - Math.abs(amplitude))] });
});

api.get('/optimizeFrequency', async (req, res) => {
  const { frequency, pointNumber } = req.query;
  process.env.inOperation = 1;
  const points = await optimizeFrequency(+frequency, Math.sqrt(+pointNumber));
  await storeOptimize(points, frequency);
  process.env.inOperation = 0;
  res.status(200).send({ points });
});

module.exports = api;
