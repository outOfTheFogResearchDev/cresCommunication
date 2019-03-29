const applyTable = require('../lookupTable/apply');

let active = false;
let _return = () => {};
const onStop = () => _return('stopped');

let prevAmp = null;
let prevPhase = null;

const poll = async resolve => {
  ({ amp: prevAmp, phase: prevPhase } = await applyTable('fine', null, prevAmp, prevPhase));
  if (resolve) resolve();
  if (active) setTimeout(poll, 500);
  else onStop();
};

module.exports = {
  startPolling: () =>
    new Promise(resolve => {
      active = true;
      prevAmp = null;
      prevPhase = null;
      poll(resolve);
    }),
  stopPolling: () =>
    !active ||
    new Promise(resolve => {
      _return = resolve;
      active = false;
    }),
};
