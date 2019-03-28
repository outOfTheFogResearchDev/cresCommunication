const applyTable = require('../lookupTable/apply');

let active = false;
let _return = () => {};
const onStop = () => _return('stopped');

const poll = async () => {
  await applyTable('fine');
  if (active) setTimeout(poll, 500);
  else onStop();
};

module.exports = {
  startPolling: () => {
    active = true;
    poll();
  },
  stopPolling: () =>
    !active ||
    new Promise(resolve => {
      _return = resolve;
      active = false;
    }),
};
