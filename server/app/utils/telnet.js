const net = require('net');

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
    return new Promise(resolve => {
      telnet.on('close', () => {
        telnet = null;
        resolve();
      });
      this.connected = false;
      telnet.destroy();
    });
  },
};
