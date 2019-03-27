const { clearTemp } = require('../../csv');

module.exports = () => clearTemp(`${__dirname}/../../lookupTable/local`);
