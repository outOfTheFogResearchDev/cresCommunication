const moku = require('../moku');
const telnet = require('../telnet');
const { setAnalyzer, getPower } = require('../cpp');
const { ms } = require('../time');
const { range } = require('../math');

const getPoint = async (power, frequency, degrees) => {
  await setAnalyzer(frequency);
  await telnet(`frequency [${frequency}]`);
  await moku.genPhase({ channel: 1, power: power > 0 ? power : 0, frequency, degrees: degrees > 0 ? degrees : 0 });
  await moku.genPhase({
    channel: 2,
    power: power < 0 ? -1 * power : 0,
    frequency,
    degrees: degrees < 0 ? -1 * degrees : 0,
  });
  await ms(10);
  const result = await getPower();
  return result;
};

const genPoints = async (freqLow, freqHigh, pointsQuantity) => {
  if (!pointsQuantity) return [];
  const frequency = range.from(freqLow * 10).to(freqHigh * 10) / 10;
  const power = range.from(-10).to(10);
  const degrees = range.from(-180).to(180);
  return [frequency, degrees, power, await getPoint(power, frequency, degrees)].concat(
    await genPoints(freqLow, freqHigh, pointsQuantity - 1)
  );
};

module.exports = genPoints;
