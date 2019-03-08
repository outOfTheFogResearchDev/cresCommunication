const moku = require('../moku');
const telnet = require('../telnet');
const { setCenter, getPower } = require('../cpp');
const { ms } = require('../time');
const { range } = require('../math');

const getPoint = async (power, frequency, degrees) => {
  await setCenter(frequency);
  let code = Math.floor((frequency - 102.5) / 5);
  if (code < 0) code = 0;
  if (code > 18) code = 18;
  await telnet.write(`SetFreq ${code}`);
  await moku.genPhase({ channel: 1, power: power > 0 ? power : 0, frequency, degrees: degrees > 0 ? degrees : 0 });
  await moku.genPhase({
    channel: 2,
    power: power < 0 ? -1 * power : 0,
    frequency,
    degrees: degrees < 0 ? -1 * degrees : 0,
  });
  await ms(100);
  return getPower();
};

const genPoints = async (freqLow, freqHigh, pointsQuantity) => {
  if (!pointsQuantity) return [];
  const frequency = range.from(freqLow * 10).to(freqHigh * 10) / 10;
  const power = range.from(-10 * 10).to(10 * 10) / 10;
  const degrees = range.from(-180 * 10).to(180 * 10) / 10;
  const rejection = await getPoint(power, frequency, degrees);
  return [[frequency, degrees, power, rejection, rejection + (10 - Math.abs(power))]].concat(
    await genPoints(freqLow, freqHigh, pointsQuantity - 1)
  );
};

module.exports = genPoints;
