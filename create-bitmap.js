const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");
const { sortAndGroupResultElements } = require("./sortAndGroupResultElements.js");
var fs = require('fs');

const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name')
  .option('-s, --size <type>', 'add radius of measured teritory [km]')

  ;

program.parse(process.argv);

const allDataArray = [];

for (i = 0; i < 4; i++) {
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

const pp = pointInfo.sort((p, b) => p.E - b.E );
fs.writeFile('mynewfile3.txt', JSON.stringify(pp), function (err) {
  if (err) throw err;
  console.log('Saved!');
});



fs.readFile('otherCoords.json', function read(err, data) {
  if (err) {
      throw err;
  }
  // const content = JSON.parse(data);
  const unusedArray= JSON.parse(data);
  const formattedCordsUnused = unusedArray.map((elem) => {
    return {phire: elem.latitude, phirn: elem.longitude, color: 0xffffffff}
  })

// console.log("formatt", formattedCordsUnused);
const all = pointInfo;
const l = [...new Set(all.map(item => (item.phire && item.phirn)))]

const all123 = all.filter(a =>  a!== undefined)

console.log("UL ", unusedArray.length, " points ", pointInfo.length, " all --- ", all.length)
const sortedDataMap = sortAndGroupResultElements(l);
// console.log("sort", pointInfo[2]);
// const sortedDataMap = sortAndGroupResultElements(pointInfo);
const sortedDataMapKeys = Object.keys(sortedDataMap);
console.log("----->>> ", sortedDataMapKeys.length);
const defaultColor = 0xFFFFFFFF;



Jimp.read(`initial.bmp`).then(image => {
  image.resize(+size, +size, () => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      // do your stuff..
      const mapKey = sortedDataMapKeys[x];

      if(mapKey !== undefined){
        // console.log("sortedDataMap[mapKey][y]",sortedDataMap[mapKey][y], "----- >> ", mapKey )

        if(sortedDataMap[mapKey][y] !== undefined) {
          image.setPixelColor(sortedDataMap[mapKey][y].color ||0xFF00FF00 , x, y);
        } else {
          image.setPixelColor(0xFFFFFF00, x, y);
        }
      } else {
        image.setPixelColor(0xFFFFFFFF, x, y);
      }


    if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
      image.write(`${program.fileName}.bmp`);
    }
    });
  })
});

});





console.log("File saved !");
return true ;

