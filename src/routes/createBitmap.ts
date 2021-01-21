import { file } from "find";
import { createKml } from "./createKml";
import { CornersType } from "./OctaveExport";

const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const glob = require('glob');
const { getColorFotLegend } = require("../../getColorForLegend.js");
const { uploadFile } = require('../../uploadFile.js');

const { sortAndGroupResultElements, sortAndGroupResultElementsNew } = require("../../sortAndGroupResultElements.js");
var fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
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



export const createBitmap = (fileName: string, size: number, corners: CornersType ) => {

// Creates a client from a Google service account key.
const storage = new Storage({keyFilename: path.join(__dirname, "../../magmapy-bb9815bb7548.json"), projectId: 'magmapy'});
const bucketName = 'klm-map-storage';

const allDataArray: any = [];
//@ts-ignore
glob(path.join(__dirname, `../../validation_results/${fileName}/`) + '*.xlsx', {}, (err:string, files: Array<string>)=>{
  console.log("Problem with finding files - ", err);
  // console.log("FF -- ", files);
  const xlxsFiles = files;
  // console.log("files ---- >> ", files);
  for (let i = 0; i < xlxsFiles.length; i++) {
    const workbook = xlsx.readFile(xlxsFiles[i]);
    const worksheet = workbook.Sheets['Page1'];
    const rowArr = xlsx.utils.sheet_to_row_object_array(worksheet)

    for(let i=0;i<rowArr.length;i++){

      var data = rowArr[i];
      // console.log(" ROW ARR ", {phire: data.Phire, phirn: data.Phirn, lb: data.Lb});
      allDataArray.push({phire: data.Phire, phirn: data.Phirn, lb: data.Lb})
    }
  }

  const pointInfo: Array<ImageCoordinatesType> = [];
// E [dBuV/m] = Ptx [dBm] - Lb [dB] + 107
// console.log("---- -- - --- -- -> ,", allDataArray.length, "12122 ", allDataArray[1]);
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
// console.log("All ", allCoordinates[2])
const sortedDataMap = sortAndGroupResultElements(allCoordinates);
// console.log("kurwa ", sortedDataMap)
const sortedDataMapKeys = Object.keys(sortedDataMap);
// console.log("sort ", sortedDataMapKeys)

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
        // rimraf(path.join(__dirname, `../../validation_results/${fileName}`), function () { console.log("Catalog is removed !"); });
        console.log('Saved!');
      });
    //   uploadFile(storage, bucketName, path.join(__dirname, `../../${fileName}.bmp`)).catch(console.error);
    //   uploadFile(storage, bucketName, path.join(__dirname, `../../${fileName}.kml`)).catch(console.error);

    }
    });
  })

});

});
})





}



