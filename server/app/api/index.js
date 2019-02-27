const { Router } = require('express');
const { moku } = require('../utils/python');
const { setAnalyzer, getPower, resetAnalyzer } = require('../utils/cpp');
const { ms } = require('../utils/time');

const api = Router();

api.get('/test', async (req, res) => {
  const { channel, dbm, frequency } = req.query;
  process.env.inOperation = 1;
  await setAnalyzer(+frequency);
  await moku(channel, dbm, frequency);
  await ms(10);
  const power = await getPower();
  await resetAnalyzer();
  process.env.inOperation = 0;
  res.status(200).send({ power });
});

module.exports = api;
