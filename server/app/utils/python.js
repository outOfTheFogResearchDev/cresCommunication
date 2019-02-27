const py = require('./python/py');

module.exports = {
  test: py('test'),
  mokuOn: py('mokuOn'),
  mokuOff: py('mokuOff'),
};
