const {
  promises: { writeFile, readFile, stat, mkdir },
} = require('fs');
const csvWrite = require('csv-stringify');
const csvRead = require('csv-parse');

const csvFolderLocation = './server/local';
const csvLocation = () => `${csvFolderLocation}/data.csv`;
const pointOptimizeLocation = (frequency, i, j) =>
  `${csvFolderLocation}/${frequency}_${i ? `${i}_${j}` : '11X11'}_Optimize.csv`;

const writeCsv = async (points, location) => {
  const csv = await new Promise(resolve => csvWrite(points, (err, data) => resolve(data)));
  // if the local folder doesnt exist, make it
  try {
    await stat(csvFolderLocation);
  } catch (e) {
    await mkdir(csvFolderLocation);
  }
  await writeFile(location(), csv);
};

const readCsv = async () => {
  // check to see if that channel has a history
  const csv = await readFile(csvLocation(), 'utf8');
  return new Promise(resolve => csvRead(csv, (err, data) => resolve(data)));
};

module.exports = {
  async storePoints(points) {
    writeCsv(points, csvLocation);
  },
  async storeOptimize(points, frequency, i, j) {
    writeCsv(points, () => pointOptimizeLocation(frequency, i, j));
  },
  getPoints: () => readCsv.catch(() => [null, null, null, null]),
};
