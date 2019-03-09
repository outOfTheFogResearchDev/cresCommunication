const min = (array, index) =>
  array.reduce((lowest, element) => (!lowest[index] || element[index] < lowest[index] ? element : lowest), []);

const asyncLoop = async (i, stop, incrimenter, cb) => {
  if (i > stop) return;
  await cb(i);
  await asyncLoop(i + incrimenter, stop, incrimenter, cb);
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
              return (Math.floor(Math.random() * (high - low + 1)) + low) / multiplier;
            },
          };
        },
      };
    },
  },
  asyncLoop,
  twoDMin: (twoDArray, index) => min(twoDArray.reduce((mins, array) => mins.concat([min(array, index)]), []), index),
};
