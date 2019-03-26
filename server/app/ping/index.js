const { Router } = require('express');
const telnet = require('../utils/telnet');
const { ms } = require('../utils/time');

const moku = process.env.TYPE === 'exe' ? null : require('../utils/moku');

const ping = Router();

const gracefulShutdown = async () => {
  const gracefulMoku = process.env.TYPE === 'exe' ? null : Promise.race([moku.gracefulShutdown(), ms(2000)]);
  const gracefulTelnet = Promise.race([telnet.disconnect(), ms(2000)]);
  await Promise.all([gracefulMoku, gracefulTelnet]);
  process.exit();
};

let pinged = false;
let operating = false;
const inOperation = () => {
  operating = true;
  pinged = true;
};
const outOperation = () => {
  operating = false;
  pinged = true;
};

const timedExit = async () => {
  if (!pinged) gracefulShutdown();
  else {
    if (!operating) pinged = false;
    setTimeout(timedExit, 2000);
  }
};

setTimeout(timedExit, 10000); // starts on server start

ping.post('/', (req, res) => {
  pinged = true;
  res.sendStatus(201);
});

ping.post('/in_operation', (req, res) => {
  inOperation();
  res.sendStatus(201);
});

ping.post('/out_operation', (req, res) => {
  outOperation();
  res.sendStatus(201);
});

module.exports = { ping, inOperation, outOperation, getOperating: () => operating };
