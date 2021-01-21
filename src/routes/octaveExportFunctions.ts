import path from "path";
import { chunkArray } from "./chunkArray";
import { createBitmap } from "./createBitmap";
import { CoordinatesType, CornersType } from "./OctaveExport";

const pLimit = require('p-limit');
const fs = require('fs');
const { execFile } = require("child_process");
const oboe = require('oboe');
const json = require('big-json');

interface ElevationSegmentType {
    latitude: number,
    longitude: number,
    elevation: number,
    distance: number
  }

//   interface SegmentResultType {
//     results: Array<ElevationSegmentType>
//     receiver: {
//       longitude: number,
//       latitude: number
//     }
//   }

  interface ElevationSegmentType {
    latitude: number,
    longitude: number,
    elevation: number,
    distance: number
  }

export interface SegmentResultType {
    coordinates: Array<ElevationSegmentType>
    receiver: {
      longitude: number,
      latitude: number
    }
  }

let ITERATIONS = 5;
let GLOWNE = 200;
let globalProcessCounter: number = 0;
let processCounter: number = 0;
let maxProcessCounter: number = 0;
let start = 0;
let globalEnd = 0;

export const handleExportToOctave = (
    // coordinatesArray: Array<SegmentResultType>,
    adapterLon: number,
    adapterLat: number,
    height: number,
    fName: string, dataFactor: number, corners: any, frequency: string, req: any) => {
    try {
        const segmentsArray: Array<Array<string>> = [];
        const receiversArray: Array<string> = [];
        const segmentsArrayStr: Array<string> = [];
        const notInlcudedCoordintesArray: Array<SegmentResultType> = [];
        const limit = pLimit(10);

        // if(dataFactor < 20) {
            // ITERATIONS = 10;
        // }
        // if (dataFactor > 100 && dataFactor < 150) {
        //     ITERATIONS = 50;
        // }
        // else if(dataFactor >= 150 && dataFactor < 300) {
        //     ITERATIONS = 250;
        //   }
        //   else if(dataFactor >= 300) {
        //     ITERATIONS = 800;
        //   }

        for (let i = 0; i < ITERATIONS; i++) {
            segmentsArray.push([]);
            segmentsArrayStr.push('');
        }

        //----------------------------------------------
        if(true) {
            let koko = 0;

            const readStream = fs.createReadStream(path.join(__dirname, '../../full-result.json'));
            const readStream2 = fs.createReadStream(path.join(__dirname, '../../full-result-2.json'));
            const readStream3 = fs.createReadStream(path.join(__dirname, '../../full-result-3.json'));
            const readStream4 = fs.createReadStream(path.join(__dirname, '../../full-result-4.json'));
            oboe(readStream)
            .node('!.*', function(drink: any){
               const k = JSON.parse(JSON.stringify(drink));
               if(k.coordinates && k.coordinates.length <= 10) {
                   notInlcudedCoordintesArray.push(k);
                   return oboe.drop;
               }
               if(k.receiver && k.coordinates){

                 writeToReceiverFile(koko, `[${k.receiver.latitude} ${k.receiver.longitude}];`, fName);
                 const a = prepareProfileData(k);
                 writeToProfileFile(koko, a, fName);
               }


               koko = koko + 1;
               return oboe.drop;

            }).done(function( finalJson: any ){
                koko = koko - 1;
                oboe(readStream2)
                .node('!.*', function(drink: any){
                   const k = JSON.parse(JSON.stringify(drink));
                   if(k.coordinates && k.coordinates.length <= 10) {
                       notInlcudedCoordintesArray.push(k);
                       return oboe.drop;
                   }
                   if(k.receiver && k.coordinates){

                     writeToReceiverFile(koko, `[${k.receiver.latitude} ${k.receiver.longitude}];`, fName);
                     const a = prepareProfileData(k);
                     writeToProfileFile(koko, a, fName);
                   }


                   koko = koko + 1;
                   return oboe.drop;

                }).done(function( finalJson: any ){
                    koko = koko - 1;
                    oboe(readStream3)
                    .node('!.*', function(drink: any){
                        const k = JSON.parse(JSON.stringify(drink));
                           if(k.coordinates && k.coordinates.length <= 10) {
                               notInlcudedCoordintesArray.push(k);
                               return oboe.drop;
                           }
                           if(k.receiver && k.coordinates){

                             writeToReceiverFile(koko, `[${k.receiver.latitude} ${k.receiver.longitude}];`, fName);
                             const a = prepareProfileData(k);
                             writeToProfileFile(koko, a, fName);
                           }


                           koko = koko + 1;
                           return oboe.drop;
                }).done(function( finalJson: any ){
                    koko = koko - 1;
                    oboe(readStream4)
                    .node('!.*', function(drink: any){
                        const k = JSON.parse(JSON.stringify(drink));
                        //    console.log("-- ", k);
                           if(k.coordinates && k.coordinates.length <= 10) {
                               notInlcudedCoordintesArray.push(k);
                               return oboe.drop;
                           }
                           if(k.receiver && k.coordinates){

                             writeToReceiverFile(koko, `[${k.receiver.latitude} ${k.receiver.longitude}];`, fName);
                             const a = prepareProfileData(k);
                             writeToProfileFile(koko, a, fName);
                           }


                           koko = koko + 1;
                           return oboe.drop;
                }).done(function( finalJson: any ){

                notInlcudedCoordintesArray.push({
                    coordinates: [],
                    receiver: {
                      longitude: adapterLon,
                      latitude: adapterLat
                    }});
                    const notIncludedReceivers = notInlcudedCoordintesArray.map(e => e.receiver);
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
                            const allKokos = koko - 1;

                            const modulo_glowny = allKokos % GLOWNE;
                            const podstawa_glowny = (allKokos - modulo_glowny) / GLOWNE;

                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, podstawa_glowny, dataFactor, corners, modulo_glowny, allKokos - 2 );

                        });
                        });
                    });
                });
            });
                });
                //----------------------------------------

                console.log("this is the end ! ")
            })

    } else {
    }

    } catch (err) {
        console.error("Some Error")
    }
};



const prepareProfileData = (k: SegmentResultType ) => {
            let segment = '[ ';
            k.coordinates.map((c: CoordinatesType, iterator:number) => {
                if(iterator < k.coordinates.length - 1 && iterator !== 0){
                    segment += `\t    ${c.distance} ${c.elevation} 4;`;
                    segment += '\n';
                } else if(iterator === 0) {
                    segment += `0 ${c.elevation} 4;\n`;
                } else {
                    segment += `\t    ${c.distance} ${c.elevation} 4;`
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
                // reject(err);
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
                // reject(err);
            }
            else {
                resolve(numberOfIteration);
            }
        });
    });
}


const runOctave = (adapterLon: number, adapterLat: number, receiverLon: null, receiverLat: null, fName: string, height: number,  frequencyStr: string, req:any, podstawa_glowny:number, dataFactor:number, corners: CornersType, modulo_glowny: number, filesNumber: number): void | number => {
    if(globalProcessCounter !== -1 ){

        globalProcessCounter = globalProcessCounter + 1;

        const moduloValGlobal = globalProcessCounter !== GLOWNE ? podstawa_glowny % ITERATIONS : (podstawa_glowny + modulo_glowny) % ITERATIONS;
        const rangeValGlobal = globalProcessCounter !== GLOWNE ? (podstawa_glowny - moduloValGlobal) / ITERATIONS : ((podstawa_glowny + modulo_glowny) - moduloValGlobal) / ITERATIONS;

        if(globalProcessCounter === GLOWNE) {
            globalProcessCounter = -1;
        }
        // let start = 0;
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
                console.log("start-> ", start, " end -> ", end);
                ls1 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}`, height, frequencyStr, i, start, end, moduloValGlobal, globalProcessCounter]);
            } else {
                start = (rangeValGlobal + 1) * i + (globalProcessCounter - 1) * ITERATIONS * (rangeValGlobal + 1);
                end = (rangeValGlobal + 1) * i  + (globalProcessCounter - 1) * ITERATIONS * (rangeValGlobal + 1) + rangeValGlobal;
                globalEnd = end;
                console.log("start-> ", start, " end -> ", end);
                ls1 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}`, height, frequencyStr, i, start, end, moduloValGlobal, globalProcessCounter]);

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
                                // runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, 0, podstawa_glowny, dataFactor, modulo_glowny );
                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequencyStr, req, podstawa_glowny, dataFactor, corners, modulo_glowny, filesNumber);
                                // return 1;
                            }, 2000);
                        }

                    }

                }
                console.log(`child process exited with code ${code}`);
            // })
        });
        }

    }

}


