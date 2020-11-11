const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("./getColorForLegend.js");


const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name')
  .option('-x, --xlxName <type>', 'add excel file name');

program.parse(process.argv);


const workbook = xlsx.readFile(`./validation_results/${program.xlxName}.xlsx`);
const worksheet = workbook.Sheets['Page1'];

const pointInfo = [];
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
// console.log("-- > ", pointInfo);

Jimp.read(`${program.fileName}.bmp`).then(image => {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    // do your stuff..
    image.setPixelColor(0xFF0000ff, x, y);

  if (x == image.bitmap.width - 1 && y == image.bitmap.height - 1) {
    image.write('jul123.png');
  }
  });

});

console.log("File saved !");
return true ;

