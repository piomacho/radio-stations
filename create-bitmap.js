const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");
const { sortAndGroupResultElements, sortAndGroupResultElementsNew } = require("./sortAndGroupResultElements.js");
var fs = require('fs');

const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name')
  .option('-s, --size <type>', 'add radius of measured teritory [km]')
  .option('-i, --iterations <type>', 'add iterations')

  ;

program.parse(process.argv);

const allDataArray = [];
const iterations = Number(program.iterations);

for (i = 0; i < iterations; i++) {
  const workbook = xlsx.readFile(`./validation_results/${program.xlxName}${i}.xlsx`);
  const worksheet = workbook.Sheets['Page1'];
  const xlData = xlsx.utils.sheet_to_json(worksheet);
  allDataArray.push(...xlData)
}

const pointInfo = [];
const size = Number(program.size) - 1;
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
    }
    });
  })

});

});


console.log("File saved !");
return true ;

