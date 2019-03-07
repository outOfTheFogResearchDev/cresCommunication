const {
  promises: { writeFile, readFile, stat, mkdir },
} = require('fs');
const csvWrite = require('csv-stringify');
const csvRead = require('csv-parse');

const csvFolderLocation = './server/local';
const csvLocation = () => `${csvFolderLocation}/data.csv`;

const writeCsv = async points => {
  const csv = await new Promise(resolve => csvWrite(points, (err, data) => resolve(data)));
  // if the local folder doesnt exist, make it
  try {
    await stat(csvFolderLocation);
  } catch (e) {
    await mkdir(csvFolderLocation);
  }
  await writeFile(csvLocation(), csv);
};

const readCsv = async () => {
  // check to see if that channel has a history
  const csv = await readFile(csvLocation(), 'utf8');
  return new Promise(resolve => csvRead(csv, (err, data) => resolve(data)));
};

module.exports = {
  async storePoints(points) {
    writeCsv(points);
  },
  getPoints: () => readCsv.catch(() => [null, null, null, null]),
};
