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

let ITERATIONS = 25;
let globalProcessCounter: number = 0;
let processCounter: number = 0;

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

        if(dataFactor < 20) {
            ITERATIONS = 5;
        }
        if (dataFactor > 100 && dataFactor < 150) {
            ITERATIONS = 50;
        }
        else if(dataFactor >= 150 && dataFactor < 300) {
            ITERATIONS = 250;
          }
          else if(dataFactor >= 300) {
            ITERATIONS = 800;
          }

        for (let i = 0; i < ITERATIONS; i++) {
            segmentsArray.push([]);
            segmentsArrayStr.push('');
        }


        //----------------------------------------------
        if(true) {
            let koko = 0;
            const readStream = fs.createReadStream(path.join(__dirname, '../../full-result.json'));
            oboe(readStream)
            .node('!.*', function(drink: any){
               const k = JSON.parse(JSON.stringify(drink));
            //    console.log("-- ", k);
               if(k.coordinates && k.coordinates.length <= 5) {
                   notInlcudedCoordintesArray.push(k);
                   return oboe.drop;
               }
               if(k.receiver && k.coordinates){
                 writeToReceiverFile(koko, `[${k.receiver.latitude} ${k.receiver.longitude}];`);
                 const a = prepareProfileData(k);
                 writeToProfileFile(koko, a);
               }


               koko = koko + 1;
               return oboe.drop;

            }).done(function( finalJson: any ){
                console.log("FInisH");
                // ITERATIONS = koko;
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

                            const mainIterations = 6;
                            globalProcessCounter = 0;
                            const moduloVal = (koko - 1) % mainIterations;
                            const rangeVal = ((koko-1) - moduloVal) / 6;
                            console.log("ITERATIONS ", koko - 1 );
                            for(let i = 1; i<mainIterations; i++){
                                runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, rangeVal, 0,i, dataFactor, corners);
                            }
                            runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req,  rangeVal, moduloVal,6, dataFactor, corners);
                        });
                    });
                });
                //----------------------------------------

                console.log("this is the end ! ")
            })

//---------------------------------------------------

            // const filteredCoordintesArray = coordinatesArray.filter((coords: SegmentResultType) => coords.coordinates.length > 5);

        //     const chunkedFilterArray = chunkArray(filteredCoordintesArray, ITERATIONS, true);
        //     prepareProfileData(chunkedFilterArray, receiversArray, segmentsArray, segmentsArrayStr)

        //     const writeToReceiversPromises: Array<unknown> = [];
        //     const writeToProfilePromises: Array<unknown> = [];

        //     // for (let j = 0; j < ITERATIONS; j++) {

        //     //     limit(() => writeToReceiversPromises.push(writeToReceiverFile(j, receiversArray[j])));
        //     // }

        //     for (let j = 0; j < ITERATIONS; j++) {
        //         limit(() => writeToProfilePromises.push(writeToProfileFile(j, segmentsArrayStr[j])));
        //     }

        //     if(filteredCoordintesArray.length > 0 ) {
        //         Promise.all(writeToProfilePromises).then(result => {

        //             Promise.all(writeToReceiversPromises).then(async(result) => {
        //                     const mainIterations = 5;
        //                     globalProcessCounter = 0;
        //                     runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, mainIterations, dataFactor, corners);

        //             });
        //         });


        // } else {
        //     console.error("Not enough points.")
        //     // return res.status(404).json({
        //     //     error: "Not enough points.",
        //     // });
        // }
        //---------------------------------------------------
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

const runBitmapScript = async(fName: string, size: number, corners: CornersType) => {
    createBitmap(fName, size, 6, corners);
}

const writeToReceiverFile = (numberOfIteration: number, receiverArray: string) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./validation_results/get_receivers${numberOfIteration}.m`, `function f = get_receivers${numberOfIteration}()\r\nf={${receiverArray}};\r\n
        end`, (err: string) => {
            // console.log("pisze")
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

const writeToProfileFile = (numberOfIteration: number, segmentsArrayStr: string) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./validation_results/prof_${numberOfIteration}.m`, `function f = prof_${numberOfIteration}()\r\nf={${segmentsArrayStr}};\r\n
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


const runOctave = (adapterLon: number, adapterLat: number, receiverLon: null, receiverLat: null, fName: string, height: number,  frequencyStr: string, req:any, rangeVal: number,additional: number, iteration:number, dataFactor:number, corners: CornersType): void | number => {
    // if(globalProcessCounter !== -1) {
        // for (let j = 0; j < mainIterations; j++) {
        //     if(globalProcessCounter < ITERATIONS) {
        //         globalProcessCounter = globalProcessCounter + 1;
        //     }
        const startVal = (iteration - 1) * rangeVal
        const endVal = iteration * rangeVal + additional -1;
        console.log(" START ", startVal, " END ", endVal);
        const ls1 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}`, height, frequencyStr, iteration, startVal, endVal]);

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
            //     if(processCounter === mainIterations) {
            //         processCounter = 0;
            //         setTimeout(function() {
            //             runOctave(adapterLon, adapterLat, receiverLon, receiverLat, fName, height, frequencyStr, req, mainIterations, dataFactor, corners);
            //             // return 1;
            //         }, 2000);
            //     }
                if(processCounter === 6) {
                    processCounter = 0;
                    req.app.io.emit("finishMapProcessing", "Zakończono !");
                    const size = ((dataFactor * 2) | 0 ) - 1;
                    runBitmapScript(fName, size, corners);
                    // const corners = getCorners()
                    ls1.kill()
        //             globalProcessCounter = -1;
        //             return 1;
                }
            }
            console.log(`child process exited with code ${code}`);
        // })
    });


}
interface SegmentFullResultType {
    receiver: {
      longitude: number,
      latitude: number
    },
    points: Array<ElevationSegmentType>
}



