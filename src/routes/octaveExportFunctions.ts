import { exec } from "child_process";
import path from "path";
import { createBitmap } from "./createBitmap";
import { CoordinatesType, CornersType } from "./OctaveExport";
const rimraf = require('rimraf');
const pLimit = require('p-limit');
const fs = require('fs');
const oboe = require('oboe');
const json = require('big-json');

interface ElevationSegmentType {
    latitude: number,
    longitude: number,
    elevation: number,
    distance: number
  }

// COMMENT
// lat - latitude,
// lng - longitude,
// e - elevation,
// d - distance
  interface ElevationSegmentType {
    lat: number,
    lng: number,
    e: number,
    d: number
  }

// COMMENT
// c - coordinates,
// r - receiver,
// lat - latitude,
// lng - longitude
export interface SegmentResultType {
    c: Array<ElevationSegmentType>
    r: {
      lng: number,
      lat: number
    }
  }

let ITERATIONS = 5;
let OCTAVE_ITERATIONS = 1;
let globalProcessCounter: number = 0;
let processCounter: number = 0;
let start = 0;
let globalEnd = 0;

export const handleExportToOctave = (
    adapterLon: string,
    adapterLat: string,
    height: number,
    erp: string,
    polarization: string,
    fName: string, dataFactor: number, corners: any, frequency: string, req: any) => {
    try {
        const segmentsArray: Array<Array<string>> = [];
        const segmentsArrayStr: Array<string> = [];
        const notInlcudedCoordintesArray: Array<SegmentResultType> = [];

        if(dataFactor > 95 && dataFactor <= 180) {
            OCTAVE_ITERATIONS = 2;
        }
        if (dataFactor > 180 && dataFactor <= 250) {
            OCTAVE_ITERATIONS = 4;
        }
        else if(dataFactor >= 250) {
            OCTAVE_ITERATIONS = 8;
        }

        for (let i = 0; i < ITERATIONS; i++) {
            segmentsArray.push([]);
            segmentsArrayStr.push('');
        }

        //----------------------------------------------
            let profleObjects = 0;

            const readStream = fs.createReadStream(path.join(__dirname, '../../full-result.json'));
            const readStream2 = fs.createReadStream(path.join(__dirname, '../../full-result-2.json'));
            const readStream3 = fs.createReadStream(path.join(__dirname, '../../full-result-3.json'));
            const readStream4 = fs.createReadStream(path.join(__dirname, '../../full-result-4.json'));
            oboe(readStream)
            .node('!.*', function(streamData: any){
               const parsedData = JSON.parse(JSON.stringify(streamData));
               if(parsedData.c && parsedData.c.length <= 3) {
                   notInlcudedCoordintesArray.push(parsedData);
                   return oboe.drop;
               }
               if(parsedData.r && parsedData.c){

                 writeToReceiverFile(profleObjects, `[${parsedData.r.lat} ${parsedData.r.lng}];`, fName);
                 const a = prepareProfileData(parsedData);
                 writeToProfileFile(profleObjects, a, fName);
               }


               profleObjects = profleObjects + 1;
               return oboe.drop;

            }).done(function(finalJson: any){
                profleObjects = profleObjects - 1;
                oboe(readStream2)
                .node('!.*', function(streamData: any){
                   const parsedData = JSON.parse(JSON.stringify(streamData));
                   if(parsedData.c && parsedData.c.length <= 3) {
                       notInlcudedCoordintesArray.push(parsedData);
                       return oboe.drop;
                   }
                   if(parsedData.r && parsedData.c){

                     writeToReceiverFile(profleObjects, `[${parsedData.r.lat} ${parsedData.r.lng}];`, fName);
                     const a = prepareProfileData(parsedData);
                     writeToProfileFile(profleObjects, a, fName);
                   }


                   profleObjects = profleObjects + 1;
                   return oboe.drop;

                }).done(function(finalJson: any){
                    profleObjects = profleObjects - 1;
                    oboe(readStream3)
                    .node('!.*', function(streamData: any){
                        const parsedData = JSON.parse(JSON.stringify(streamData));
                           if(parsedData.c && parsedData.c.length <= 3) {
                               notInlcudedCoordintesArray.push(parsedData);
                               return oboe.drop;
                           }
                           if(parsedData.r && parsedData.c){

                             writeToReceiverFile(profleObjects, `[${parsedData.r.lat} ${parsedData.r.lng}];`, fName);
                             const a = prepareProfileData(parsedData);
                             writeToProfileFile(profleObjects, a, fName);
                           }


                           profleObjects = profleObjects + 1;
                           return oboe.drop;
                }).done(function(finalJson: any){
                    profleObjects = profleObjects - 1;
                    oboe(readStream4)
                    .node('!.*', function(streamData: any){
                        const parsedData = JSON.parse(JSON.stringify(streamData));
                           if(parsedData.c && parsedData.c.length <= 3) {
                               notInlcudedCoordintesArray.push(parsedData);
                               return oboe.drop;
                           }
                           if(parsedData.r && parsedData.c){

                             writeToReceiverFile(profleObjects, `[${parsedData.r.lat} ${parsedData.r.lng}];`, fName);
                             const a = prepareProfileData(parsedData);
                             writeToProfileFile(profleObjects, a, fName);
                           }


                           profleObjects = profleObjects + 1;
                           return oboe.drop;
                }).done(function(finalJson: any){


                    const notIncludedReceivers = notInlcudedCoordintesArray.map(e => e.r);
                    const stringifyStream = json.createStringifyStream({
                        body: notIncludedReceivers
                    });
                    let notInlcudedCoordintesReceivers = '';
                    fs.unlink('otherCoords.json', function(err:string) {
                        stringifyStream.on('data', function(strChunk: string) {
                        notInlcudedCoordintesReceivers += strChunk.toString();
                    });
                    stringifyStream.on('end', () =>{
                        fs.writeFile('otherCoords.json', notInlcudedCoordintesReceivers ,(err:string) => {

                            if (err) {
                                throw err;
                            }
                            console.log("JSON data is saved.");

                            globalProcessCounter = 0;
                            const allProfleObjects = profleObjects - 1;

                            const main_modulo = allProfleObjects % OCTAVE_ITERATIONS;
                            const main_basis = (allProfleObjects - main_modulo) / OCTAVE_ITERATIONS;
                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, main_basis, dataFactor, corners, main_modulo, allProfleObjects - 2, erp, polarization );

                        });
                        });
                    });
                });
            });
                });

                console.log("Zakończono pisanie do plików - receivers / profiles ! ")
            })



    } catch (err) {
        console.error("Error connected with writting !")
        rimraf(path.join(__dirname, `../../validation_results/${fName}`), function () { console.log("Catalog with profiles and receviers is removed !"); });
    }
};



const prepareProfileData = (parsedData: SegmentResultType ) => {
            let segment = '[ ';
            parsedData.c.map((c: CoordinatesType, iterator:number) => {
                if(iterator < parsedData.c.length - 1 && iterator !== 0){
                    segment += `\t    ${c.d} ${c.e} 4;`;
                    segment += '\n';
                } else if(iterator === 0) {
                    segment += `0 ${c.e} 4;\n`;
                } else {
                    segment += `\t    ${c.d} ${c.e} 4;`
                }

            })

            segment += ']';
        return segment;
}

export const runBitmapScript = async(fName: string, size: number, corners: CornersType, adapterLat: string, adapterLon: string, erp: string, polarization: string) => {
    createBitmap(fName, size, corners, adapterLat, adapterLon, erp, polarization);
}

const writeToReceiverFile = (numberOfIteration: number, receiverArray: string, fileName: string) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./validation_results/${fileName}/get_receivers${numberOfIteration}.m`, `function f = get_receivers${numberOfIteration}()\r\nf={${receiverArray}};\r\n
        end`, (err: string) => {
            if (err) {
                console.log(err);
            }
            else {
                resolve(numberOfIteration);
            }
        });
    });
}

const writeToProfileFile = (numberOfIteration: number, segmentsArrayStr: string, fileName: string) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./validation_results/${fileName}/prof_${numberOfIteration}.m`, `function f = prof_${numberOfIteration}()\r\nf={${segmentsArrayStr}};\r\n
            end`, (err: string) => {
            if (err) {
                console.log(err);
            }
            else {
                resolve(numberOfIteration);
            }
        });
    });
}


const runOctave = (adapterLon: string, adapterLat: string, receiverLon: null, receiverLat: null, fName: string, height: number,  frequencyStr: string, req:any, main_basis:number, dataFactor:number, corners: CornersType, main_modulo: number, filesNumber: number, erp: string, polarization: string): void | number => {

    const timerId = setInterval(() => {
        const stats = fs.statSync("counter.txt")
        const fileSizeInBytes = stats.size;
        req.app.io.emit("octaveLoader", (fileSizeInBytes/filesNumber));
    }, 3000);

    if(globalProcessCounter !== -1 ){
        globalProcessCounter = globalProcessCounter + 1;

        const moduloValGlobal = globalProcessCounter !== OCTAVE_ITERATIONS ? main_basis % ITERATIONS : (main_basis + main_modulo) % ITERATIONS;
        const rangeValGlobal = globalProcessCounter !== OCTAVE_ITERATIONS ? (main_basis - moduloValGlobal) / ITERATIONS : ((main_basis + main_modulo) - moduloValGlobal) / ITERATIONS;

        if(globalProcessCounter === OCTAVE_ITERATIONS) {
            globalProcessCounter = -1;
        }
        let end = rangeValGlobal;
        for(let i = 0; i< ITERATIONS; i++) {
            let ls1: any;

            if(globalProcessCounter === -1) {
                if(i === 0) {
                    start = globalEnd + 1;
                } else {
                    start = start + (rangeValGlobal + 1);

                }
                end = start + rangeValGlobal > filesNumber ? filesNumber : start + rangeValGlobal;
                console.log("New Octave iteration...");
                const polarizationValue = polarization === 'H' ? 0 : 1;
                ls1 = exec(`octave -i --persist octave-script.m ${adapterLon} ${adapterLat} ${receiverLon} ${receiverLat} ${fName} ${height} ${frequencyStr} ${i} ${start} ${end} ${moduloValGlobal} ${globalProcessCounter} ${erp} ${polarizationValue}`);
            } else {
                start = (rangeValGlobal + 1) * i + (globalProcessCounter - 1) * ITERATIONS * (rangeValGlobal + 1);
                end = (rangeValGlobal + 1) * i  + (globalProcessCounter - 1) * ITERATIONS * (rangeValGlobal + 1) + rangeValGlobal;
                globalEnd = end;
                console.log("New Octave iteration...");
                const polarizationValue = polarization === 'H' ? 0 : 1;
                ls1 = exec(`octave -i --persist octave-script.m ${adapterLon} ${adapterLat} ${receiverLon} ${receiverLat} ${fName} ${height} ${frequencyStr} ${i} ${start} ${end} ${moduloValGlobal} ${globalProcessCounter} ${erp} ${polarizationValue}`);

            }

            ls1.stdout.on("data", (data: string) => {
                console.log(data);
            });


            ls1.on('error', (error: { message: string }) => {
                req.app.io.emit("octaveError", "Wystąpił błąd");
                console.log(`error: ${error.message}`);
            });

            ls1.on("close", (code: string) => {
                if(+code === 0) {
                    processCounter = processCounter + 1;

                    if(processCounter === ITERATIONS) {
                        processCounter = 0;
                        if(globalProcessCounter === -1){
                            clearInterval(timerId);
                            req.app.io.emit("finishMapProcessing", "Zakończono !");
                            fs.writeFile('counter.txt', '', function(){console.log('Counter reset done!')})
                            req.app.io.emit("octaveLoader", 0);
                            const size = ((dataFactor * 2) | 0 ) - 1;
                            runBitmapScript(fName, size, corners, adapterLat, adapterLon, erp, polarization);
                            // const corners = getCorners()
                            ls1.kill()
                        } else {
                            setTimeout(function() {
                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequencyStr, req, main_basis, dataFactor, corners, main_modulo, filesNumber, erp, polarization);
                            }, 2000);
                        }

                    }

                }
                console.log(`child process exited with code ${code}`);
        });
        }

    }

}


