const { Router } = require('express');
const moku = require('../utils/moku');
const telnet = require('../utils/telnet');
const genPoints = require('../utils/algorithms/genPoints');
const { getPower, setAnalyzer, resetAnalyzer } = require('../utils/cpp');
const { storePoints } = require('../utils/csv');
const { ms } = require('../utils/time');

const api = Router();

api.post('/connect', async (req, res) => {
  if (!moku.connected) await moku.connect();
  if (!telnet.connected) await telnet.connect();
  res.sendStatus(201);
});

api.get('/gen_points', async (req, res) => {
  const { freqLow, freqHigh, pointsQuantity } = req.query;
  process.env.inOperation = true;
  await setAnalyzer(150);
  await telnet.write(`mp 0 1 0 `);
  await telnet.write(`mp 0 2 0 `);
  await telnet.write(`mp 0 3 0 `);
  const points = await genPoints(+freqLow, +freqHigh, +pointsQuantity);
  await resetAnalyzer();
  await storePoints(points);
  process.env.inOperation = false;
  res.status(200).send({ points });
});

api.get('/gen', async (req, res) => {
  const { frequency, amplitude, phase } = req.query;
  process.env.inOperation = 1;
  await setAnalyzer(+frequency);
  await moku.genPhase({
    channel: 1,
    frequency,
    power: +amplitude > 0 ? +amplitude : 0,
    degrees: +phase > 0 ? +phase : 0,
  });
  await moku.genPhase({
    channel: 2,
    frequency,
    power: +amplitude < 0 ? -1 * +amplitude : 0,
    degrees: +phase < 0 ? -1 * +phase : 0,
  });
  let code = Math.floor((frequency - 102.5) / 5);
  if (code < 0) code = 0;
  if (code > 18) code = 18;
  await telnet.write(`SetFreq ${code}`);
  await ms(100);
  const power = await getPower();
  await resetAnalyzer();
  process.env.inOperation = 0;
  res.status(200).send({ point: [frequency, amplitude, phase, power, power + (10 - Math.abs(amplitude))] });
});

module.exports = api;
