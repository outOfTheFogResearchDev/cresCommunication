const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const api = require('./api/index');
const moku = require('./utils/moku');
const telnet = require('./utils/telnet');
const { ms } = require('./utils/time');

const config = process.env.NODE_ENV === 'production' ? process.env : require('../../config/config');

const app = express();

app.disable('x-powered-by');

app.use(
  session({
    secret: config.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // one hour
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(`${__dirname}/../../client/dist/`));

app.use('/api', api);

let ping = false;

const gracefulShutdown = async () => {
  const gracefulMoku = Promise.race([moku.gracefulShutdown(), ms(2000)]);
  const gracefulTelnet = Promise.race([telnet.disconnect(), ms(2000)]);
  await Promise.all([gracefulMoku, gracefulTelnet]);
  process.exit();
};

const timedExit = async () => {
  if (!ping) gracefulShutdown();
  else {
    if (!+process.env.inOperation) ping = false;
    setTimeout(timedExit, 2000);
  }
};

setTimeout(timedExit, 10000); // starts on server start

app.post('/ping', (req, res) => {
  ping = true;
  res.sendStatus(201);
});

module.exports = app;
