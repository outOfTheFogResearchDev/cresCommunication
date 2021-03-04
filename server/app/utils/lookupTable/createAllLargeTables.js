const createLargeTable = require('./createLargeTable');
const { asyncLoop } = require('../math');

(async () => {
  await asyncLoop(105, 195, 5, async i => {
    await createLargeTable(i);
  });
})().then(() => console.log('done')); // eslint-disable-line no-console
