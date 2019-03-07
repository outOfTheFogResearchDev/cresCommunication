module.exports = {
  range: { from: low => ({ to: high => Math.floor(Math.random() * (high - low + 1)) + low }) },
};
