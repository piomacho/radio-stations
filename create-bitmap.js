const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");

const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name')
  .option('-s, --size <type>', 'add radius of measured teritory [km]')

  ;

program.parse(process.argv);

const workbook = xlsx.readFile(`./validation_results/${program.xlxName}.xlsx`);
const worksheet = workbook.Sheets['Page1'];

const pointInfo = [];
const size = Number(program.size)
// E [dBuV/m] = Ptx [dBm] - Lb [dB] + 107

var xlData = xlsx.utils.sheet_to_json(worksheet);
 for (let i = 0; i < xlData.length; i++) {
    const phire = xlData[i].Phire;
    const phirn = xlData[i].Phirn;
    const lb = xlData[i].Lb;
    const e = 60 - lb  + 107
    const color = getColorFotLegend(e);

    pointInfo.push({'phire': phire, 'phirn': phirn, 'lb': lb, 'E': e, 'color': color})
}

Jimp.read(`initial.bmp`).then(image => {
  image.resize(+size, +size, () => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      // do your stuff..
      if(x%2 === 0){
        image.setPixelColor(0xFF0000, x, y);
      }else {
        image.setPixelColor(0xFF0000ff, x, y);
      }

    if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
      image.write(`${program.fileName}.bmp`);
    }
    });
  })


});

console.log("File saved !");
return true ;

