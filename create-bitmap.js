const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");
const { sortAndGroupResultElements } = require("./sortAndGroupResultElements.js");

const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name')
  .option('-s, --size <type>', 'add radius of measured teritory [km]')

  ;

program.parse(process.argv);

const allDataArray = [];

for (i = 1; i <= 4; i++) {
  const workbook = xlsx.readFile(`./validation_results/${program.xlxName}${i}.xlsx`);
  const worksheet = workbook.Sheets['Page1'];
  const xlData = xlsx.utils.sheet_to_json(worksheet);
  allDataArray.push(...xlData)
}

// Jimp.read(`initial.bmp`).then(image => {
//   image.resize(+size, +size, () => {
//     image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
//         image.setPixelColor(defaultColor, x, y);
//     });
//   })
// });

const pointInfo = [];
const size = Number(program.size)
// E [dBuV/m] = Ptx [dBm] - Lb [dB] + 107

// var xlData = xlsx.utils.sheet_to_json(worksheet);
 for (let i = 0; i < allDataArray.length; i++) {
    const phire = allDataArray[i].Phire;
    const phirn = allDataArray[i].Phirn;
    const lb = allDataArray[i].Lb;
    const e = 60 - lb  + 107
    const color = getColorFotLegend(e);

    pointInfo.push({'phire': phire, 'phirn': phirn, 'lb': lb, 'E': e, 'color': color})
}
const sortedDataMap = sortAndGroupResultElements(pointInfo);
console.log("sort", pointInfo[2]);
const sortedDataMapKeys = Object.keys(sortedDataMap);
const defaultColor = 0xFFFFFFFF;



Jimp.read(`initial.bmp`).then(image => {
  image.resize(+size, +size, () => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      // do your stuff..
      const mapKey = sortedDataMapKeys[x];

      if(mapKey !== undefined){
        if(sortedDataMap[mapKey][y] !== undefined) {
          image.setPixelColor(sortedDataMap[mapKey][y].color, x, y);
        } else {
          image.setPixelColor(defaultColor, x, y);
        }
      } else {
        image.setPixelColor(defaultColor, x, y);
      }


    if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
      image.write(`${program.fileName}.bmp`);
    }
    });
  })
});

console.log("File saved !");
return true ;

