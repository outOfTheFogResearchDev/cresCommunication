const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const api = require('./api/index');
const { ping } = require('./ping/index');
const config = require('../../config/config');

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

app.use(express.static(`${__dirname}/client`));

app.use('/api', api);

app.use('/ping', ping);

app.get('/env', (req, res) => res.status(200).send({ env: process.env.TYPE }));

module.exports = app;
