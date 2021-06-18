const { Router } = require('express');
const telnet = require('../utils/telnet');
const { storePoints } = require('../utils/csv');
const { ms } = require('../utils/time');
const { startPolling, stopPolling } = require('../utils/algorithms/pollingSoftware');
const { inOperation, outOperation, getOperating } = require('../ping/index');
const { asyncLoop } = require('../utils/math');
const { setFrequency } = require('../utils/global');

let getPower;
let setAnalyzer;
let resetAnalyzer;
let moku;
let genRandomPoints;
let optimizeFrequency;
let graphPhaseOutput;
if (process.env.TYPE !== 'exe') {
  ({ getPower, setAnalyzer, resetAnalyzer } = require('../utils/cpp'));
  moku = require('../utils/moku');
  genRandomPoints = require('../utils/algorithms/genRandomPoints');
  optimizeFrequency = require('../utils/algorithms/optimizeFrequency');
  graphPhaseOutput = require('../utils/algorithms/graphPhaseOutput');
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

api.post('/manual_frequency', async (req, res) => {
  const { manualFrequency } = req.body;
  setFrequency(+manualFrequency);
  await telnet.setFreq(manualFrequency);
  res.sendStatus(201);
});

api.post('/stop_polling', async (req, res) => {
  await stopPolling();
  res.sendStatus(201);
});

api.post('/software', async (req, res) => {
  await startPolling();
  res.sendStatus(201);
});

api.post('/firmware', async (req, res) => {
  await stopPolling();
  await telnet.write(`mp3 0 `);
  res.sendStatus(201);
});

api.post('/manual_codes', async (req, res) => {
  const { ps1, ps2, pd } = req.body;
  await telnet.write(`mp3 1 ${ps1} ${ps2} ${pd} `);
  res.sendStatus(201);
});

if (process.env.TYPE !== 'exe') {
  /**
   * type = auto
   * type = table
   */
  api.post('/gen_points/:type', async (req, res) => {
    const { freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity } = req.body;
    const { type } = req.params;
    if (getOperating()) {
      res.sendStatus(201);
      return;
    }
    inOperation();
    await setAnalyzer(150);
    if (type === 'auto') {
      await telnet.write(`mp3 0 `);
    }
    const points = await genRandomPoints(freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity, type);
    await resetAnalyzer();
    await storePoints(points);
    outOperation();
    res.sendStatus(201);
  });

  api.get('/gen', async (req, res) => {
    const { frequency, amplitude, phase } = req.query;
    if (getOperating()) {
      res.status(200).send({ point: [] });
      return;
    }
    inOperation();
    await setAnalyzer(+frequency);
    await moku.setPoint(+frequency, +amplitude, +phase);

    await ms(10);
    const power = await getPower();
    await resetAnalyzer();
    outOperation();
    res.status(200).send({ point: [frequency, amplitude, phase, power, power + (10 - Math.abs(amplitude))] });
  });

  api.post('/optimizeFrequency', async (req, res) => {
    const { frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable } = req.body;
    if (getOperating()) {
      res.sendStatus(201);
      return;
    }
    inOperation();
    // await optimizeFrequency(+frequency + 2.5, ampLow, ampHigh, phaseLow, phaseHigh, usingTable || usingTable);
    await optimizeFrequency(frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable || usingTable);
    outOperation();
    res.sendStatus(201);
  });

  api.post('/optimizeFrequencies', async (req, res) => {
    const { frequencyLow, frequencyHigh, ampLow, ampHigh, phaseLow, phaseHigh, usingTable } = req.body;
    if (getOperating()) {
      res.sendStatus(201);
      return;
    }
    inOperation();
    await asyncLoop(frequencyLow, frequencyHigh, 5, async frequency => {
      // await optimizeFrequency(+frequency + 2.5, ampLow, ampHigh, phaseLow, phaseHigh, usingTable || usingTable);
      await optimizeFrequency(frequency, ampLow, ampHigh, phaseLow, phaseHigh, usingTable || usingTable);
    });
    outOperation();
    res.sendStatus(201);
  });
  api.post('/graphPhase', async (req, res) => {
    const { frequency } = req.body;
    if (getOperating()) {
      res.status(201);
      return;
    }
    inOperation();
    if (frequency) graphPhaseOutput(+frequency);
    else graphPhaseOutput.runAll();
    outOperation();
    res.sendStatus(201);
  });
}

module.exports = api;
