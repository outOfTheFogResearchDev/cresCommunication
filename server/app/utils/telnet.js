const net = require('net');
const { setFrequency } = require('./global');

let telnet;
let _return = () => {};
const onData = data => _return(data.toString());

module.exports = {
  connected: false,
  write: command =>
    new Promise(resolve => {
      _return = resolve;
      telnet.write(`${command}\r\n`);
    }),
  async setFreq(frequency) {
    setFrequency(frequency);
    let code = Math.round(frequency * 10);
    if (code < 100) code = 100;
    if (code > 200) code = 200;
    await this.write(`sf ${(code / 10).toFixed(1)}`);
  },
  async getAmpPhaseCodes() {
    const { amplitude: amp, phase_360: phase } = JSON.parse(await this.write('apd'));
    return { amp, phase };
  },
  async parseGlobalStat() {
    const globalStat = await this.write('GlobalStat');
    let index = globalStat.indexOf('Frequency:');
    const frequency = +globalStat.substring(index + 11, index + 14);
    index = globalStat.indexOf('Phase 1:', index + 14);
    const phase1 = +globalStat.substring(index + 12, index + 16);
    index = globalStat.indexOf('Phase 2:', index + 16);
    const phase2 = +globalStat.substring(index + 12, index + 16);
    index = globalStat.indexOf('Amplitude:', index + 16);
    const amp = +globalStat.substring(index + 12, index + 16);
    index = globalStat.indexOf('360 Phase:', index + 16);
    let phase = +globalStat.substring(index + 12, index + 16);
    if (phase === 0) {
      if (phase1 > 1000 && phase2 > 1000) {
        phase = 3230;
      }
      if (phase1 < 1000 && phase2 > 1000) {
        phase = 1615;
      }
      if (phase1 > 1000 && phase2 < 1000) {
        phase = 4850;
      }
    }
    index = globalStat.indexOf('PS1', index + 16);
    const ps1 = +globalStat.substring(index + 15, index + 20);
    index = globalStat.indexOf('PS2', index + 20);
    const ps2 = +globalStat.substring(index + 15, index + 20);
    index = globalStat.indexOf('PD', index + 20);
    const pd = +globalStat.substring(index + 14, index + 19);
    return { frequency, phase1, phase2, amp, phase, ps1, ps2, pd };
  },
  connect() {
    return new Promise(resolve => {
      telnet = net.connect({ port: 7, host: '192.168.1.50' }, () => {
        telnet.on('data', onData);
        this.connected = true;
        resolve();
      });
    });
  },
  disconnect() {
    return (
      !telnet ||
      new Promise(resolve => {
        telnet.on('close', () => {
          telnet = null;
          resolve();
        });
        this.connected = false;
        telnet.destroy();
      })
    );
  },
};
