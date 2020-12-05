const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");
const { sortAndGroupResultElements, sortAndGroupResultElementsNew } = require("./sortAndGroupResultElements.js");
var fs = require('fs');
const sortObject = require('sort-object-keys');

const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name')
  .option('-s, --size <type>', 'add radius of measured teritory [km]')

  ;

program.parse(process.argv);

const allDataArray = [];

for (i = 0; i < 250; i++) {
  const workbook = xlsx.readFile(`./validation_results/${program.xlxName}${i}.xlsx`);
  const worksheet = workbook.Sheets['Page1'];
  const xlData = xlsx.utils.sheet_to_json(worksheet);
  allDataArray.push(...xlData)
}

const pointInfo = [];
const size = Number(program.size)
// E [dBuV/m] = Ptx [dBm] - Lb [dB] + 107

 for (let i = 0; i < allDataArray.length; i++) {
    const phire = allDataArray[i].Phire;
    const phirn = allDataArray[i].Phirn;
    const lb = allDataArray[i].Lb;
    const e = 60 - lb  + 107
    const color = getColorFotLegend(e);

    // pointInfo.push({'phire': parseFloat((+phire).toFixed(13)), 'phirn': parseFloat((+phirn).toFixed(13)), 'lb': lb, 'E': e, 'color': color})
    pointInfo.push({'phire': +phire, 'phirn': +phirn, 'color': color})
    // pointInfo.push({'latitude': +phire, 'longitude': +phirn});
}

fs.readFile('otherCoords.json', function read(err, data) {
  if (err) {
      throw err;
  }
  const unusedArray= JSON.parse(data);
  const formattedCordsUnused = unusedArray.map((elem) => {
    return {phire: parseFloat((+elem.latitude).toFixed(13)), phirn: parseFloat((+elem.longitude).toFixed(13)), color: 0xff0000ff}
  })

const dupa = [...pointInfo, ...formattedCordsUnused]
fs.writeFile('mynewfile3.json', JSON.stringify(dupa), function (err) {
  if (err) throw err;
  console.log('Saved!');
});
const sortedDataMap = sortAndGroupResultElements(dupa);
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
// });




console.log("File saved !");
return true ;

