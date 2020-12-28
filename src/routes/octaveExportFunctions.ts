import { chunkArray } from "./chunkArray";
import { createBitmap } from "./createBitmap";
import { CoordinatesType, CornersType } from "./OctaveExport";

const pLimit = require('p-limit');
const fs = require('fs');
const { execFile } = require("child_process");
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
    coordinatesArray: Array<SegmentResultType>,
    adapterLon: number,
    adapterLat: number,
    height: number,
    fName: string, dataFactor: number, corners: any, frequency: string, req: any) => {
    try {
        const segmentsArray: Array<Array<string>> = [];
        const receiversArray: Array<string> = [];
        const segmentsArrayStr: Array<string> = [];
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
            // fs.unlinkSync('otherCoords.json');

            // console.log("filteredCoordintesArray", coordinatesArray);
            const filteredCoordintesArray = coordinatesArray.filter((coords: SegmentResultType) => coords.coordinates.length > 5);

            const notInlcudedCoordintesArray = coordinatesArray.filter((coords: SegmentResultType) => coords.coordinates.length <= 5);
            console.log("notInlcudedCoordintesArray")
            notInlcudedCoordintesArray.push({
                coordinates: [],
                receiver: {
                  longitude: adapterLon,
                  latitude: adapterLat
                }
            })


            const notIncludedReceivers = notInlcudedCoordintesArray.map(e => e.receiver);
            const stringifyStream = json.createStringifyStream({
                body: notIncludedReceivers
            });
            let notInlcudedCoordintesReceivers = '';
            fs.unlink('otherCoords.json', function(err:string) {
                stringifyStream.on('data', function(strChunk: string) {
                // console.log("str cHunk ",strChunk.toString() );
                notInlcudedCoordintesReceivers += strChunk.toString();




            });
            stringifyStream.on('end', () =>{
                fs.writeFile('otherCoords.json', notInlcudedCoordintesReceivers ,(err:string) => {

                    if (err) {
                        throw err;
                    }
                    console.log("JSON data is saved.");
                });
            });
        });



            const chunkedFilterArray = chunkArray(filteredCoordintesArray, ITERATIONS, true);
            prepareProfileData(chunkedFilterArray, receiversArray, segmentsArray, segmentsArrayStr)

            const writeToReceiversPromises: Array<unknown> = [];
            const writeToProfilePromises: Array<unknown> = [];

            for (let j = 0; j < ITERATIONS; j++) {

                limit(() => writeToReceiversPromises.push(writeToReceiverFile(j, receiversArray[j])));
            }

            for (let j = 0; j < ITERATIONS; j++) {
                limit(() => writeToProfilePromises.push(writeToProfileFile(j, segmentsArrayStr[j])));
            }

            if(filteredCoordintesArray.length > 0 ) {
                Promise.all(writeToProfilePromises).then(result => {

                    Promise.all(writeToReceiversPromises).then(async(result) => {
                            const mainIterations = 5;
                            globalProcessCounter = 0;
                            runOctave(adapterLon, adapterLat, null, null, fName, height, frequency, req, mainIterations, dataFactor, corners);

                    });
                });


        } else {
            console.error("Not enough points.")
            // return res.status(404).json({
            //     error: "Not enough points.",
            // });
        }
    } else {
    }

    } catch (err) {
        console.error("Some Error")
    }
};



const prepareProfileData = (chunkedFilterArray: Array<Array<SegmentResultType>>, receiversArray:Array<string>, segmentsArray: Array<Array<string>>, segmentsArrayStr: Array<string> ) => {
    for (let i = 0; i < ITERATIONS; i++) {
        let receivers123= ' ';
        chunkedFilterArray[i] && chunkedFilterArray[i].map((c: SegmentResultType) => {
            receivers123 += `[${c.receiver.latitude} ${c.receiver.longitude}];`
            receivers123 += '\n';

            if(receivers123 !== '' && receivers123 !== '\n') {
                receiversArray[i] = receivers123;

            }
        });
    }

    for (let i = 0; i < ITERATIONS; i++) {
        chunkedFilterArray[i] && chunkedFilterArray[i].map((coordinateData: SegmentResultType) => {
            let segment = ' ';
            coordinateData.coordinates.map((c: CoordinatesType, iterator:number) => {
                if(iterator < coordinateData.coordinates.length - 1 && iterator !== 0){
                    segment += `\t    ${c.distance} ${c.elevation} 4;`;
                    segment += '\n';
                } else if(iterator === 0) {
                    segment += `0 ${c.elevation} 4;\n`;
                } else {
                    segment += `\t    ${c.distance} ${c.elevation} 4;`
                }

            })
            if(segment !== '' && segment !== '\n') {
                segmentsArray[i].push(segment);
            }
        });
    }



    for (let j = 0; j < ITERATIONS; j++) {
        for(let i = 0; i <  segmentsArray[j].length; i++) {
            if(i !== segmentsArray.length -1) {
                segmentsArrayStr[j] += `[${segmentsArray[j][i]}]; `;
            } else if(segmentsArray[i]) {
                segmentsArrayStr[j] += `[${segmentsArray[j][i]}];`;
            }
        }
    }

}

const runBitmapScript = async(fName: string, size: number, corners: CornersType) => {
    createBitmap(fName, size, globalProcessCounter, corners);
}

const writeToReceiverFile = (numberOfIteration: number, receiverArray: string) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./validation_results/get_receivers${numberOfIteration}.m`, `function f = get_receivers${numberOfIteration}()\r\nf={${receiverArray}};\r\n
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


const runOctave = (adapterLon: number, adapterLat: number, receiverLon: null, receiverLat: null, fName: string, height: number,  frequencyStr: string, req:any, mainIterations: number, dataFactor:number, corners: CornersType): void | number => {
    if(globalProcessCounter !== -1) {
        for (let j = 0; j < mainIterations; j++) {
            if(globalProcessCounter < ITERATIONS) {
                globalProcessCounter = globalProcessCounter + 1;
            }
        const ls1 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}${globalProcessCounter-1}`, height, frequencyStr, globalProcessCounter-1]);

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
                if(processCounter === mainIterations) {
                    processCounter = 0;
                    setTimeout(function() {
                        runOctave(adapterLon, adapterLat, receiverLon, receiverLat, fName, height, frequencyStr, req, mainIterations, dataFactor, corners);
                        // return 1;
                    }, 2000);
                }
                if(globalProcessCounter >= ITERATIONS) {
                    req.app.io.emit("finishMapProcessing", "Zakończono !");
                    const size = ((dataFactor * 2) | 0 ) - 1;
                    runBitmapScript(fName, size, corners);
                    // const corners = getCorners()
                    ls1.kill()
                    globalProcessCounter = -1;
                    return 1;
                }
            }
            console.log(`child process exited with code ${code}`);
        })
    }
}

}
interface SegmentFullResultType {
    receiver: {
      longitude: number,
      latitude: number
    },
    points: Array<ElevationSegmentType>
}



