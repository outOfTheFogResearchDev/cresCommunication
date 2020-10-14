const moku = require('../moku');
const { setCenter, getPower } = require('../cpp');
const { ms } = require('../time');
const { random } = require('../math');
const applyTable = require('../lookupTable/apply');

const getPoint = async (frequency, power, degrees, type, tableType) => {
  await setCenter(frequency);
  await moku.setPoint(frequency, power, degrees);
  await ms(250);
  if (type === 'table') {
    await applyTable(tableType);
    await ms(10);
  }
  return getPower();
};

const genRandomPoints = async (
  freqLow,
  freqHigh,
  ampLow,
  ampHigh,
  phaseLow,
  phaseHigh,
  pointsQuantity,
  type,
  tableType,
  fails
) => {
  if (!pointsQuantity) return [];
  const frequency = random.decimals(1).from(freqLow).to(freqHigh);
  const power = random.decimals(1).from(ampLow).to(ampHigh);
  const degrees = random.decimals(1).from(phaseLow).to(phaseHigh);
  const rejection = await getPoint(frequency, power, degrees, type, tableType);
  const correctedRejection = rejection + (10 - Math.abs(power));
  const next = () =>
    genRandomPoints(freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity - 1, type, fails);
  const point = [frequency, power, degrees, rejection, correctedRejection];
  return fails && correctedRejection < -20 ? next() : [point].concat(await next());
};

module.exports = genRandomPoints;
