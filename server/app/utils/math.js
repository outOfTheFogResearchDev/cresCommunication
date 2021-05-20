const min = (array, index) =>
  array.reduce((lowest, element) => (!lowest[index] || element[index] < lowest[index] ? element : lowest), []);

const asyncLoop = async (i, stop, incrimenter, cb, s) => {
  const m = incrimenter > 0 ? 1 : -1;
  if (!incrimenter || i * m > stop * m) return null;
  let offset = 0;
  if (s) {
    const [skip, center] = s;
    if (skip !== 0 && i === center - skip * m) {
      offset = (skip * 2 + 1) * m;
    }
  }
  const done = await cb(i + offset, offset ? 'check side' : null);
  if (done) return done;
  return asyncLoop(i + offset + incrimenter, stop, incrimenter, cb, s);
};

module.exports = {
  random: {
    decimals: digits => {
      const multiplier = 10 ** digits;
      return {
        from: l => {
          const low = l * multiplier;
          return {
            to: h => {
              const high = h * multiplier;
              const offByOne = high < 0 && low < 0 ? -1 : 1;
              return (Math.floor(Math.random() * (high - low + offByOne)) + low) / multiplier;
            },
          };
        },
      };
    },
  },
  asyncLoop,
  twoDMin: (twoDArray, index) =>
    min(
      twoDArray.reduce((mins, array) => mins.concat([min(array, index)]), []),
      index
    ),
};
