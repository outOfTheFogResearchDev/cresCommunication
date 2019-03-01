const net = require('net');

const telnet = net.connect({ port: 7, host: '192.168.1.50' }, () => {
  telnet.write('GlobalStat\r\n');
  telnet.on('data', data => console.log(data.toString()));
});
