const { Router } = require('express');
const moku = require('../utils/moku');
const telnet = require('../utils/telnet');
const genPoints = require('../utils/algorithms/genPoints');
const { resetAnalyzer } = require('../utils/cpp');
const { storePoints } = require('../utils/csv');

const api = Router();

api.post('/connect', async (req, res) => {
  if (!moku.connected) await moku.connect();
  if (!telnet.connected) await telnet.connect();
  res.sendStatus(201);
});

api.get('/gen_points', async (req, res) => {
  const { freqLow, freqHigh, pointsQuantity } = req.query;
  const points = await genPoints(+freqLow, +freqHigh, +pointsQuantity);
  await resetAnalyzer();
  await storePoints(points);
  res.status(200).send({ points });
});

module.exports = api;
