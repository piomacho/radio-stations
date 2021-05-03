import { file } from "find";
import { createKml } from "./createKml";
import { CornersType } from "./OctaveExport";

const { Command } = require('commander');
const xlsx = require('xlsx');
let Jimp = require('jimp')
const glob = require('glob');
const { getColorFotLegend } = require("../../getColorForLegend.js");
const { uploadFile } = require('../../storageBucketFunctions.js');

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
    lat: number,
    lng: number,
}



export const createBitmap = (fileName: string, size: number, corners: CornersType, adapterLat: string, adapterLon: string, erp: string, polarization: string ) => {

// Creates a client from a Google service account key.
const storage = new Storage({keyFilename: path.join(__dirname, "../../magmapy-49829cb5b2d7.json"), projectId: 'magmapy'});
const bucketName = 'klm-map-storage';

const allDataArray: any = [];
//@ts-ignore
glob(path.join(__dirname, `../../validation_results/${fileName}/`) + '*.xlsx', {}, (err:string, files: Array<string>)=>{
  if(err){
    console.log("Problem with finding files - ", err);
  }

  const xlxsFiles = files;
  for (let i = 0; i < xlxsFiles.length; i++) {
    const workbook = xlsx.readFile(xlxsFiles[i]);
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
    const erpValue = Number(erp);
    const eirp = 10*Math.log10((erpValue * 1000000)) + 2.15;

    const e = eirp - lb  + 107
    const color = getColorFotLegend(e);

    pointInfo.push({'phire': +phire, 'phirn': +phirn, 'color': color})
}
//@ts-ignore
pointInfo.push({'phire':+adapterLat.toFixed(13) , 'phirn':+adapterLon.toFixed(13) , 'color': 0xffffff80})

fs.readFile(path.join(__dirname, `../../otherCoords.json`), function read(err: string, data: string) {
  if (err) {
      throw err;
  }
  const unusedArray= JSON.parse(data);
  const formattedCordsUnused = unusedArray.map((elem: CoordinatesType) => {
    return {phire: parseFloat((+elem.lat).toFixed(13)), phirn: parseFloat((+elem.lng).toFixed(13)), color: 0xffffff80}
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

Jimp.read(path.join(__dirname, `../../initial.png`)).then((image: any) => {
  image.resize(+size, +size, () => {
    sortedDataMapKeys.map((elementFromAll, index) => {
      const mapKey = elementFromAll;
      const filteredDataMap = sortedDataMap[mapKey].filter((thing:any, index:any, self:any) =>
              index === self.findIndex((t:any) => (
                t.phirn === thing.phirn
              )) );
        for(let ii = 0; ii < +size; ii++){

            if(filteredDataMap[ii] === undefined){
              // console.log("Błąd w rysowaniu klucza -> ",filteredDataMap[ii], " wartość - > ", mapKey)
            }
            image.setPixelColor(filteredDataMap[ii] ? filteredDataMap[ii].color : 0xffffff00, ii, index);
          }
        console.log(index)
    if (index == sortedDataMapKeys.length - 1) {
      image.write(path.join(__dirname, `../../${fileName}.png`));
      const kmlFile = createKml(corners, `${fileName}.png`);
      fs.appendFile(`${fileName}.kml`, kmlFile, function (err: string) {
        if (err) throw err;
        uploadFile(storage, bucketName, path.join(__dirname, `../../${fileName}.png`)).catch(console.error);
        uploadFile(storage, bucketName, path.join(__dirname, `../../${fileName}.kml`)).catch(console.error);
        rimraf(path.join(__dirname, `../../validation_results/${fileName}`), function () { console.log("Catalog with profiles and receviers is removed !"); });
      });
    }
    });
  })

});

});
})

}



