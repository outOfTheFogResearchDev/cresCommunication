const { Router } = require('express');
const moku = require('../utils/moku');
const { setAnalyzer, getPower, resetAnalyzer } = require('../utils/cpp');
const { ms } = require('../utils/time');

const api = Router();

api.post('/connect', async (req, res) => {
  await moku.connect();
  res.sendStatus(201);
});

api.get('/gen', async (req, res) => {
  const { channel, dbm, frequency } = req.query;
  process.env.inOperation = 1;
  await setAnalyzer(+frequency);
  await moku.genPhase({ channel, power: dbm, frequency });
  await ms(10);
  const power = await getPower();
  await resetAnalyzer();
  process.env.inOperation = 0;
  res.status(200).send({ power });
});

module.exports = api;
