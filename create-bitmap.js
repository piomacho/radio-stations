const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");
const { uploadFile } = require('./uploadFile.js');
const { createKml } = require('./createKml.js');
const { sortAndGroupResultElements, sortAndGroupResultElementsNew } = require("./sortAndGroupResultElements.js");
var fs = require('fs');
const path = require('path');
const {Storage} = require('@google-cloud/storage');

const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name')
  .option('-s, --size <type>', 'add radius of measured teritory [km]')
  .option('-i, --iterations <type>', 'add iterations')
  .option('-a, --maxLongMaxLat <type>', 'maxLongMaxLat')
  .option('-b, --maxLongMinLat <type>', 'maxLongMinLat')
  .option('-c, --minLongMaxLat <type>', 'minLongMaxLat')
  .option('-d, --minLongMinLat <type>', 'minLongMinLat');

  ;

program.parse(process.argv);
// Creates a client from a Google service account key.
const storage = new Storage({keyFilename: path.join(__dirname, "./magmapy-bb9815bb7548.json"), projectId: 'magmapy'});
const bucketName = 'klm-map-storage';

const allDataArray = [];
const iterations = Number(program.iterations);

for (i = 0; i < iterations; i++) {
  const workbook = xlsx.readFile(`./validation_results/${program.xlxName}-${i}.xlsx`);
  const worksheet = workbook.Sheets['Page1'];
  const xlData = xlsx.utils.sheet_to_json(worksheet);
  allDataArray.push(...xlData)
}

const pointInfo = [];
const size = Number(program.size) - 1;
console.log("=-=-=-=-=-=-= korners ", program.maxLongMaxLat)
// E [dBuV/m] = Ptx [dBm] - Lb [dB] + 107

 for (let i = 0; i < allDataArray.length; i++) {
    const phire = allDataArray[i].Phire;
    const phirn = allDataArray[i].Phirn;
    const lb = allDataArray[i].Lb;
    const e = 60 - lb  + 107
    const color = getColorFotLegend(e);

    pointInfo.push({'phire': +phire, 'phirn': +phirn, 'color': color})
}

fs.readFile('otherCoords.json', function read(err, data) {
  if (err) {
      throw err;
  }
  const unusedArray= JSON.parse(data);
  const formattedCordsUnused = unusedArray.map((elem) => {
    return {phire: parseFloat((+elem.latitude).toFixed(13)), phirn: parseFloat((+elem.longitude).toFixed(13)), color: 0xff0000ff}
  })

const allCoordinates = [...pointInfo, ...formattedCordsUnused]

const sortedDataMap = sortAndGroupResultElements(allCoordinates);
const sortedDataMapKeys = Object.keys(sortedDataMap);

Jimp.read(`initial.bmp`).then(image => {
  image.resize(+size, +size, () => {
    sortedDataMapKeys.map((elementFromAll, index) => {
      const mapKey = elementFromAll;
        for(let ii = 0; ii < +size; ii++){
          if(sortedDataMap[mapKey][ii] === undefined){
            console.log("myk -> ",sortedDataMap[mapKey][ii], " =-=- > ", mapKey)
          }
          image.setPixelColor(sortedDataMap[mapKey][ii] ? sortedDataMap[mapKey][ii].color : 0xff0000ff, ii, index);
        }
        console.log(index)
    if (index == sortedDataMapKeys.length - 1) {
      console.log("all is saved now !")
      image.write(`${program.fileName}.bmp`);
      const kmlFile = createKml(program.maxLongMaxLat, program.maxLongMinLat, program.minLongMaxLat, program.minLongMinLat,  `${program.fileName}.bmp`);
      fs.appendFile(`${program.fileName}.kml`, kmlFile, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
      uploadFile(storage, bucketName, `${program.fileName}.bmp`).catch(console.error);
      // uploadFile(storage, bucketName, `${program.fileName}.bmp`).catch(console.error);


    }
    });
  })

});

});


console.log("File saved !");
// return true ;

