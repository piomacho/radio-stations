import { createKml } from "./createKml";
import { CornersType } from "./OctaveExport";

const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const { getColorFotLegend } = require("../../getColorForLegend.js");
const { uploadFile } = require('../../uploadFile.js');

const { sortAndGroupResultElements, sortAndGroupResultElementsNew } = require("../../sortAndGroupResultElements.js");
var fs = require('fs');
const path = require('path');
const {Storage} = require('@google-cloud/storage');

interface ImageCoordinatesType {
    phire: number,
    phirn: number,
    color: string;
}

interface CoordinatesType {
    latitude: number,
    longitude: number,
}

export const createBitmap = (fileName: string, size: number, iterations: number, corners: CornersType ) => {

// Creates a client from a Google service account key.
const storage = new Storage({keyFilename: path.join(__dirname, "../../magmapy-bb9815bb7548.json"), projectId: 'magmapy'});
const bucketName = 'klm-map-storage';

const allDataArray = [];

for (let i = 1; i <= iterations; i++) {
  const workbook = xlsx.readFile(path.join(__dirname, `../../validation_results/${fileName}-${i}.xlsx`));
  const worksheet = workbook.Sheets['Page1'];
  const rowArr = xlsx.utils.sheet_to_row_object_array(worksheet)

  for(let i=0;i<rowArr.length;i++){
    var data = rowArr[i];
    allDataArray.push({phire: data.Phire, phirn: data.Phirn, lb: data.Lb})
  }
}

const pointInfo: Array<ImageCoordinatesType> = [];
// E [dBuV/m] = Ptx [dBm] - Lb [dB] + 107

 for (let i = 0; i < allDataArray.length; i++) {
    const phire = allDataArray[i].phire;
    const phirn = allDataArray[i].phirn;
    const lb = allDataArray[i].lb;
    const e = 60 - lb  + 107
    const color = getColorFotLegend(e);

    pointInfo.push({'phire': +phire, 'phirn': +phirn, 'color': color})
}

fs.readFile(path.join(__dirname, `../../otherCoords.json`), function read(err: string, data: string) {
  if (err) {
      throw err;
  }
  const unusedArray= JSON.parse(data);
  const formattedCordsUnused = unusedArray.map((elem: CoordinatesType) => {
    return {phire: parseFloat((+elem.latitude).toFixed(13)), phirn: parseFloat((+elem.longitude).toFixed(13)), color: 0xff0000ff}
  })

const allCoordinates = [...pointInfo, ...formattedCordsUnused]

const sortedDataMap = sortAndGroupResultElements(allCoordinates);
const sortedDataMapKeys = Object.keys(sortedDataMap);

fs.stat(path.join(__dirname, `../../${fileName}.kml`), function (err: string, stats: string) {

    if (err) {
        return console.error(err);
    }

    fs.unlink(path.join(__dirname, `../../${fileName}.kml`),function(err: string){
         if(err) return console.log(err);
         console.log('file deleted successfully');
    });
});

Jimp.read(path.join(__dirname, `../../initial.bmp`)).then((image: any) => {
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
      image.write(path.join(__dirname, `../../${fileName}.bmp`));
      const kmlFile = createKml(corners, `${fileName}.bmp`);
      fs.appendFile(`${fileName}.kml`, kmlFile, function (err: string) {
        if (err) throw err;
        console.log('Saved!');
      });
    //   uploadFile(storage, bucketName, path.join(__dirname, `../../${fileName}.bmp`)).catch(console.error);
    //   uploadFile(storage, bucketName, path.join(__dirname, `../../${fileName}.kml`)).catch(console.error);

    }
    });
  })

});

});
}



