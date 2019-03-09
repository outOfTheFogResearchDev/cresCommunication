const moku = require('../moku');
const { setCenter, getPower } = require('../cpp');
const { ms } = require('../time');
const { random } = require('../math');

const getPoint = async (frequency, power, degrees) => {
  await setCenter(frequency);
  await moku.setPoint(frequency, power, degrees);
  await ms(10);
  return getPower();
};

const genRandomPoints = async (freqLow, freqHigh, pointsQuantity) => {
  if (!pointsQuantity) return [];
  const frequency = random
    .decimals(1)
    .from(freqLow)
    .to(freqHigh);
  const power = random
    .decimals(1)
    .from(-10)
    .to(10);
  const degrees = random
    .decimals(1)
    .from(-180)
    .to(180);
  const rejection = await getPoint(frequency, power, degrees);
  return [[frequency, power, degrees, rejection, rejection + (10 - Math.abs(power))]].concat(
    await genRandomPoints(freqLow, freqHigh, pointsQuantity - 1)
  );
};

module.exports = genRandomPoints;
