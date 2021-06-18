const moku = require('../moku');
const telnet = require('../telnet');
const { setCenter, getPower } = require('../cpp');
const { ms } = require('../time');
const { random } = require('../math');
const applyTable = require('../lookupTable/apply');
// const applyTable = require('../lookupTable/applyLarge');

const additionalData = false;
const additionalDataThreshold = -30;
const additionalDataIterations = 5;

let prevFreq = 0;

const getPoint = async (frequency, power, degrees, type, skip) => {
  if (!skip) {
    if (frequency !== prevFreq) {
      await setCenter(frequency);
      prevFreq = frequency;
    }
    await moku.setPoint(frequency, power, degrees);
    await ms(250);
  }
  let amp, phase, ps1, ps2, pd; // eslint-disable-line one-var
  if (type === 'table') {
    ({ amp, phase, ps1, ps2, pd } = await applyTable());
  } else {
    await telnet.setFreq(frequency);
  }
  await ms(100);
  return { rejection: await getPower(), amp, phase, ps1, ps2, pd };
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
  frequency = 0,
  power = 0,
  degrees = 0,
  reRun = 0,
  reSend = 0,
  comeBack = 0
) => {
  if (!pointsQuantity) return [];
  console.log(pointsQuantity); // eslint-disable-line no-console
  if (!reRun && !reSend && !comeBack) {
    /* eslint-disable no-param-reassign */
    frequency = random.decimals(1).from(freqLow).to(freqHigh);
    power = random.decimals(1).from(ampLow).to(ampHigh);
    degrees = random.decimals(1).from(phaseLow).to(phaseHigh);
    /* eslint-enable no-param-reassign */
  }
  if (!reRun && !reSend && comeBack) {
    await moku.setPoint(frequency, 0, 0);
    await ms(250);
  }
  const { rejection, amp, phase, ps1, ps2, pd } = await getPoint(frequency, power, degrees, type, reRun);
  const correctedRejection = rejection + (10 - Math.abs(power));
  let point = [frequency, power, degrees, rejection, correctedRejection];
  let next;
  if (additionalData && type === 'table') {
    let signifier = 1;
    if (reRun) signifier = 2;
    else if (reSend) signifier = 3;
    else if (comeBack) signifier = 4;
    const aData = [amp, phase, ps1, ps2, pd, signifier];
    point = point.concat(aData);
    if (!reRun && !reSend && !comeBack && correctedRejection > additionalDataThreshold)
      next = () =>
        genRandomPoints(
          freqLow,
          freqHigh,
          ampLow,
          ampHigh,
          phaseLow,
          phaseHigh,
          pointsQuantity - 1,
          type,
          frequency,
          power,
          degrees,
          additionalDataIterations,
          additionalDataIterations,
          additionalDataIterations
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
          pointsQuantity - (!reRun && !reSend && !comeBack ? 1 : 0),
          type,
          frequency,
          power,
          degrees,
          reRun ? reRun - 1 : reRun,
          !reRun && reSend ? reSend - 1 : reSend,
          !reRun && !reSend && comeBack ? comeBack - 1 : comeBack
        );
  } else
    next = () => genRandomPoints(freqLow, freqHigh, ampLow, ampHigh, phaseLow, phaseHigh, pointsQuantity - 1, type);
  return [point].concat(await next());
};

module.exports = genRandomPoints;
