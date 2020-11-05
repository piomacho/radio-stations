const { Command } = require('commander');
let Jimp = require('jimp')


const program = new Command();
program.version('0.0.1');

program
  .option('-n, --fileName <type>', 'add file name');

program.parse(process.argv);

let image = new Jimp(300, 530, 'green', (err, image) => {
    if (err) throw err;
})

let file = `${program.fileName}.bmp`
console.log("File saved !");
return image.write(file) //

