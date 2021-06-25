const moku = require('../moku');
const telnet = require('../telnet');
const { setCenter } = require('../cpp');
const { ms } = require('../time');
const { random } = require('../math');

const iterations = 1;
let prevFreq = 0;

const getPoint = async (frequency, power, degrees, type, run) => {
  if (frequency !== prevFreq) {
    prevFreq = frequency;
    await setCenter(frequency);
    await moku.setPoint(frequency, power, degrees);
    await ms(250);
  }
  if (type === 'auto') await telnet.setFreq(frequency);
  if (run === 0) {
    // do nothing extra
  } else if (run === 1) {
    await telnet.getAmpPhaseCodes();
  } else if (run === 2) {
    await telnet.getAmpPhaseCodes();
    await telnet.write('mp3 1 0 0 0 ');
    if (type === 'auto') await telnet.write('mp3 0 ');
  } else if (run === 3) {
    await telnet.getAmpPhaseCodes();
    await telnet.write('mp3 1 0 0 0 ');
    if (type === 'auto') await telnet.write('mp3 0 ');
    await ms(100);
  }
  const { amp, phase } = await telnet.getAmpPhaseCodes();
  return { amp, phase };
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
  run = 0,
  it = 0,
  frequency = 0,
  power = 0,
  degrees = 0
) => {
  if (!pointsQuantity) return [];
  console.log(pointsQuantity); // eslint-disable-line no-console
  if (!run) {
    /* eslint-disable no-param-reassign */
    frequency = random.decimals(1).from(freqLow).to(freqHigh);
    power = random.decimals(1).from(ampLow).to(ampHigh);
    degrees = random.decimals(1).from(phaseLow).to(phaseHigh);
    /* eslint-enable no-param-reassign */
  }
  const { amp, phase } = await getPoint(frequency, power, degrees, type, run);

  const point = [frequency, power, degrees, amp, phase, run];

  let next;
  if (run < 3) {
    if (it + 1 < iterations)
      next = () =>
        genRandomPoints(
          freqLow,
          freqHigh,
          ampLow,
          ampHigh,
          phaseLow,
          phaseHigh,
          pointsQuantity,
          type,
          run,
          it + 1,
          frequency,
          power,
          degrees
        );
    else
      next = () =>
        genRandomPoints(
          freqLow,
          freqHigh,
          ampLow,
          ampHigh,
          phaseLow,
          phaseHigh,
          pointsQuantity,
          type,
          run + 1,
          0,
          frequency,
          power,
          degrees
        );
  } else
    next = () => genRandomPoints(freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity - 1, type);

  return [point].concat(await next());
};

module.exports = genRandomPoints;
