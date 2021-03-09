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
    adapterLon: number,
    adapterLat: number,
    height: number,
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

                notInlcudedCoordintesArray.push({
                    c: [],
                    r: {
                      lng: adapterLon,
                      lat: adapterLat
                    }});
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
                            const podstawa_glowny = (allProfleObjects - main_modulo) / OCTAVE_ITERATIONS;

                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, podstawa_glowny, dataFactor, corners, main_modulo, allProfleObjects - 2 );

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

export const runBitmapScript = async(fName: string, size: number, corners: CornersType) => {
    createBitmap(fName, size, corners);
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


const runOctave = (adapterLon: number, adapterLat: number, receiverLon: null, receiverLat: null, fName: string, height: number,  frequencyStr: string, req:any, podstawa_glowny:number, dataFactor:number, corners: CornersType, main_modulo: number, filesNumber: number): void | number => {
    if(globalProcessCounter !== -1 ){

        globalProcessCounter = globalProcessCounter + 1;
        req.app.io.emit("octaveLoader", globalProcessCounter/OCTAVE_ITERATIONS);

        const moduloValGlobal = globalProcessCounter !== OCTAVE_ITERATIONS ? podstawa_glowny % ITERATIONS : (podstawa_glowny + main_modulo) % ITERATIONS;
        const rangeValGlobal = globalProcessCounter !== OCTAVE_ITERATIONS ? (podstawa_glowny - moduloValGlobal) / ITERATIONS : ((podstawa_glowny + main_modulo) - moduloValGlobal) / ITERATIONS;

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
                ls1 = exec(`octave -i --persist octave-script.m ${adapterLon} ${adapterLat} ${receiverLon} ${receiverLat} ${fName} ${height} ${frequencyStr} ${i} ${start} ${end} ${moduloValGlobal} ${globalProcessCounter}`);
            } else {
                start = (rangeValGlobal + 1) * i + (globalProcessCounter - 1) * ITERATIONS * (rangeValGlobal + 1);
                end = (rangeValGlobal + 1) * i  + (globalProcessCounter - 1) * ITERATIONS * (rangeValGlobal + 1) + rangeValGlobal;
                globalEnd = end;
                console.log("New Octave iteration...");
                ls1 = exec(`octave -i --persist octave-script.m ${adapterLon} ${adapterLat} ${receiverLon} ${receiverLat} ${fName} ${height} ${frequencyStr} ${i} ${start} ${end} ${moduloValGlobal} ${globalProcessCounter}`);

            }

            ls1.stdout.on("data", (data: string) => {
                console.log(data);
            });

            ls1.stderr.on("data", (data: string) => {
                console.log(`stderr: ${data}`);
            });

            ls1.on('error', (error: { message: string }) => {

                console.log(`error: ${error.message}`);
            });

            ls1.on("close", (code: string) => {
                if(+code === 0) {
                    processCounter = processCounter + 1;

                    if(processCounter === ITERATIONS) {
                        processCounter = 0;
                        if(globalProcessCounter === -1){
                            req.app.io.emit("finishMapProcessing", "Zakończono !");
                            const size = ((dataFactor * 2) | 0 ) - 1;
                            runBitmapScript(fName, size, corners);
                            // const corners = getCorners()
                            ls1.kill()
                        } else {
                            setTimeout(function() {
                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequencyStr, req, podstawa_glowny, dataFactor, corners, main_modulo, filesNumber);
                            }, 2000);
                        }

                    }

                }
                console.log(`child process exited with code ${code}`);
        });
        }

    }

}


