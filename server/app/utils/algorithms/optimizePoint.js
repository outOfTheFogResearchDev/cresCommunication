const moku = require('../moku');
const telnet = require('../telnet');
const { getPower } = require('../cpp');
const { ms } = require('../time');
const { asyncLoop, twoDMin } = require('../math');

/*
        First Point: 
        # 511 or # 0
Start:   -1       0

  Stage -1: ps1 down
  until: 0 511

  New Stage Rotation:
  Start: # 0

  Stage 0: ps2 up
  until: # #

  Stage 1: ps1 down
  until: 0 #

  Stage 2: ps2 up
  until: 0 511

  Go to Stage 1
*/

const getGrid = async (
  frequency,
  power,
  degrees,
  amp,
  phase,
  prevLowest,
  Stage,
  newPower,
  iteration = 0,
  fresh = false,
  newStageRotation = false,
  narrowPd = false
) => {
  const grid = [];
  let psStart;
  let psStop;
  let pdStart;
  let pdStop;
  let psStep;
  let pdStep;
  if (fresh) {
    if (iteration === -1) {
      psStart = 25;
      psStop = 475;
      psStep = 50;
      if (narrowPd) {
        pdStart = prevLowest[7] - 24;
        pdStop = prevLowest[7] + 24;
        pdStep = 8;
      } else {
        pdStart = 25;
        pdStop = 475;
        pdStep = 50;
      }
    } else if (iteration === 0) {
      psStart = prevLowest[5] - 35;
      psStop = prevLowest[5] + 35;
      psStep = 5;
      if (narrowPd) {
        pdStart = prevLowest[7] - 6;
        pdStop = prevLowest[7] + 6;
        pdStep = 3;
      } else {
        pdStart = prevLowest[7] - 35;
        pdStop = prevLowest[7] + 35;
        pdStep = 5;
      }
    } else if (iteration === 1) {
      psStart = prevLowest[5] - 3;
      psStop = prevLowest[5] + 3;
      psStep = 1;
      pdStart = prevLowest[7] - 3;
      pdStop = prevLowest[7] + 3;
      pdStep = 1;
    }
  } else if (!fresh) {
    if (iteration === -1) {
      psStart = prevLowest[Stage.isPs1() ? 5 : 6] - 32;
      psStop = prevLowest[Stage.isPs1() ? 5 : 6] + 32;
      psStep = 4;
      pdStart = prevLowest[7] - 20;
      pdStop = prevLowest[7] + 20;
      pdStep = 4;
    } else if (iteration === 0 && newPower) {
      psStart = prevLowest[Stage.isPs1() ? 5 : 6] - 16;
      psStop = prevLowest[Stage.isPs1() ? 5 : 6] + 16;
      psStep = 4;
      pdStart = prevLowest[7] - 16;
      pdStop = prevLowest[7] + 16;
      pdStep = 4;
    } else if (iteration === 0 && !newPower) {
      psStart = Stage.isPs1() ? prevLowest[5] - 16 : prevLowest[6];
      psStop = Stage.isPs1() ? prevLowest[5] : prevLowest[6] + 16;
      psStep = 4;
      pdStart = prevLowest[7] - 16;
      pdStop = prevLowest[7] + 8;
      pdStep = 4;
    } else if (iteration === 1) {
      psStart = prevLowest[Stage.isPs1() ? 5 : 6] - 2;
      psStop = prevLowest[Stage.isPs1() ? 5 : 6] + 2;
      psStep = 1;
      pdStart = prevLowest[7] - 2;
      pdStop = prevLowest[7] + 2;
      pdStep = 1;
    }
  }
  await asyncLoop(psStart, psStop, psStep, async i => {
    if (i < 0 || i > 511 || (Stage.value === 0 && i > prevLowest[5])) return null;
    grid.push([]);
    const index = grid.length - 1;
    await telnet.write(`mp 1 ${Stage.isPs1() ? 1 : 2} ${i} `);
    return asyncLoop(pdStart, pdStop, pdStep, async j => {
      if (j < 0 || j > 511) return null;
      const setPs2ForFreshRuns = newStageRotation ? 0 : 511;
      const previousPs2 = prevLowest.length ? prevLowest[6] : setPs2ForFreshRuns;
      grid[index].push([
        frequency,
        power,
        degrees,
        amp,
        phase,
        Stage.isPs1() ? i : prevLowest[5],
        Stage.isPs1() ? previousPs2 : i,
        j,
      ]);
      await telnet.write(`mp 1 3 ${j} `);
      await ms(5);
      let data;
      try {
        data = await getPower();
      } catch (e) {
        try {
          console.log('getPower 1 failed'); // eslint-disable-line no-console
          await ms(1000);
          data = await getPower();
        } catch (er) {
          try {
            console.log('getPower 2 failed'); // eslint-disable-line no-console
            await ms(60000);
            data = await getPower();
          } catch (err) {
            console.log('getPower 3 failed'); // eslint-disable-line no-console
            data = 0;
          }
        }
      }
      grid[index][grid[index].length - 1].push(data);
      const correctedValue = data + (10 - Math.abs(power));
      grid[index][grid[index].length - 1].push(correctedValue);
      return null;
    });
  });
  const lowest = twoDMin(grid, 9);
  return iteration === 1
    ? lowest
    : getGrid(
        frequency,
        power,
        degrees,
        amp,
        phase,
        lowest,
        Stage,
        newPower,
        iteration + 1,
        fresh,
        newStageRotation,
        narrowPd
      );
};

module.exports = async (frequency, power, degrees, prevPoint, Stage, newPower) => {
  console.log(power, degrees); // eslint-disable-line no-console
  await moku.setPoint(frequency, power, degrees);
  await ms(250);
  const { amp, phase } = await telnet.parseGlobalStat();
  let point = [];
  if (prevPoint.length) {
    await telnet.write(`mp 1 1 ${prevPoint[5]} `);
    await telnet.write(`mp 1 2 ${prevPoint[6]} `);
    point = await getGrid(frequency, power, degrees, amp, phase, prevPoint, Stage, newPower);

    if (
      (Stage.isPs1() && (point[5] === 384 || point[5] === 256 || point[5] === 128)) ||
      (Stage.isPs2() && (point[6] === 383 || point[6] === 255 || point[6] === 127))
    ) {
      console.log('trying 128 - 256 - 384'); // eslint-disable-line no-console
      const newPrevPoint = prevPoint.slice();
      if (Stage.isPs1()) newPrevPoint[5] = prevPoint[5] - 32;
      else newPrevPoint[6] = prevPoint[6] + 32;
      newPrevPoint[7] = prevPoint[7] + 20;
      const checkPoint = await getGrid(frequency, power, degrees, amp, phase, newPrevPoint, Stage, newPower, -1);
      if (checkPoint.length && checkPoint[9] < point[9]) point = checkPoint;
      else if (
        Stage.value === 0 &&
        ((point[5] > 383 && point[5] <= 383 + 16) ||
          (point[5] > 255 && point[5] <= 255 + 16) ||
          (point[5] > 127 && point[5] <= 127 + 16))
      ) {
        console.log('trying next stage'); // eslint-disable-line no-console
        const tempPoint = point.slice();
        tempPoint[6] = point[5]; // eslint-disable-line prefer-destructuring
        Stage.next();
        let nextStage = await getGrid(frequency, power, degrees, amp, phase, tempPoint, Stage, newPower);
        if (nextStage[5] === 384 || nextStage[5] === 256 || nextStage[5] === 128) {
          const newTempPoint = tempPoint.slice();
          newTempPoint[5] = tempPoint[5] - 32;
          newTempPoint[7] = tempPoint[7] + 20;
          const checkTempPoint = await getGrid(
            frequency,
            power,
            degrees,
            amp,
            phase,
            newTempPoint,
            Stage,
            newPower,
            -1
          );
          if (checkTempPoint.length && checkTempPoint[9] < nextStage[9]) nextStage = checkTempPoint;
        }

        if (point[9] < nextStage[9]) Stage.setValue(0);
        else point = nextStage;
      }
    }

    if (point[9] > -35 && !Stage.isNearBaseCase(point)) {
      console.log('trying wide'); // eslint-disable-line no-console
      const newPrevPoint = prevPoint.slice();
      if (Stage.isPs1()) newPrevPoint[5] = prevPoint[5] - 16;
      else newPrevPoint[6] = prevPoint[6] + 16;
      const checkPoint = await getGrid(frequency, power, degrees, amp, phase, newPrevPoint, Stage, newPower);
      if (checkPoint.length && checkPoint[9] < point[9]) point = checkPoint;
    }

    if (Stage.isNearBaseCase(point)) {
      console.log('trying next stage'); // eslint-disable-line no-console
      const tempPoint = point.slice();
      if (Stage.value === -1 || Stage.value === 2) tempPoint[6] = 0;
      // eslint-disable-next-line prefer-destructuring
      else if (Stage.value === 0) tempPoint[6] = point[5];
      else if (Stage.value === 1) tempPoint[5] = 0;

      let nextStage = [];
      const tempValue = Stage.value;
      Stage.next();
      if (Stage.value === 0) {
        Stage.setValue(-1);
        await telnet.write(`mp 1 2 0 `);
        nextStage = await getGrid(
          frequency,
          power,
          degrees,
          amp,
          phase,
          tempPoint,
          Stage,
          newPower,
          -1,
          true,
          true,
          true
        );
        Stage.setValue(0);
      } else nextStage = await getGrid(frequency, power, degrees, amp, phase, tempPoint, Stage, newPower);
      if (point[9] < nextStage[9]) Stage.setValue(tempValue);
      else point = nextStage;
    }
  } else {
    await telnet.write(`mp 1 2 511 `);
    Stage.setValue(-1);
    const firstSide = await getGrid(frequency, power, degrees, amp, phase, prevPoint, Stage, newPower, -1, true, false);

    let secondSide = [];
    if (firstSide[9] > -50) {
      await telnet.write(`mp 1 2 0 `);
      secondSide = await getGrid(frequency, power, degrees, amp, phase, prevPoint, Stage, newPower, -1, true, true);
    }

    if (!secondSide.length || firstSide[9] < secondSide[9]) {
      point = firstSide;
      Stage.setValue(-1);
    } else {
      point = secondSide;
      Stage.setValue(0);
    }
  }
  return point;
};
