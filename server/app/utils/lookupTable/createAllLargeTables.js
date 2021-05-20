const createLargeTable = require('./createLargeTable');
const { asyncLoop } = require('../math');

(async () => {
  await asyncLoop(100, 200, 2.5, async i => {
    // await asyncLoop(100, 200, 5, async i => {
    await createLargeTable(i);
  });
})().then(() => console.log('done')); // eslint-disable-line no-console
