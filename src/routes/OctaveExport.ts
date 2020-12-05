import { Request, Response, Router } from 'express';
const path = require("path");
// const { exec } = require("child_process");
import {chunkArray} from './chunkArray';
const { spawn, execFile } = require("child_process");

const fs = require('fs');
const xl = require('excel4node');
const async = require("async");
const wb = new xl.Workbook();

const pLimit = require('p-limit');


export interface CoordinatesType {
    latitude: number;
    elevation: number;
    longitude: number;
    distance: number;
}

interface ElevationSegmentType {
    latitude: number,
    longitude: number,
    elevation: number,
    distance: number
  }

  interface SegmentResultType {
    coordinates: Array<ElevationSegmentType>
    receiver: {
      longitude: number,
      latitude: number
    }
  }

  interface SegmentFullResultType {
    receiver: {
      longitude: number,
      latitude: number
    },
    points: Array<ElevationSegmentType>
  }
const router = Router();


const formatCoordinates1 = (coords: any) => {
    return coords.map((c: CoordinatesType) => {
         return  `${c.distance.toString().replace(',', '.')} ${c.elevation.toString().replace(',', '.')} 4;`;
     });
 };


router.post('/send/', async (req: Request, res: Response) => {
    try {
        const coordinates1 = formatCoordinates1(req.body.coordinates);
        const adapterLon = req.body.adapter.longitude;
        const adapterLat = req.body.adapter.latitude;
        const height = req.body.adapter.height;
        const receiverLon = req.body.receiver.longitude;
        const receiverLat = req.body.receiver.latitude;
        const fName = req.body.fileName;
        const frequency = Number(req.body.frequency)/100;

        const frequencyStr = frequency.toString();

        fs.writeFile('./validation_results/prof_b2iseac.m', `function [d,h,z] = prof_b2iseac()\r\na=[ ...\r\n${coordinates1.join("\r\n")}];\r\nd = a(:,1);\r\n
        h = a(:,2);\r\n
        z = a(:,3);\r\n
        \r\n
        end`, function (err: any) {
          if (err) return console.log(err);
          const ls = execFile("octave", ["-i", "--persist", "validate_p2001_b2iseac.m", adapterLon, adapterLat, receiverLon, receiverLat, fName, height, frequencyStr]);

          ls.stdout.on("data", (data: string) => {
              console.log(data);
          });

          ls.stderr.on("data", (data: string) => {
              console.log(`stderr: ${data}`);
          });

          ls.on('error', (error: { message: string }) => {
              console.log(`error: ${error.message}`);
          });

          ls.on("close", (code: string) => {
              console.log(`child process exited with code ${code}`);
          })
        });

        return res.status(200).json({
            message: "Success",
        });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
});

let globalStorage:  Array<SegmentResultType> = [];
let ITERATIONS = 250;
let globalProcessCounter: number = 0;
let processCounter: number = 0;
let maxProcessCounter: number = 0;

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


const runOctave = (adapterLon: number, adapterLat: number, receiverLon: number, receiverLat: number, fName: string, height: number,  frequencyStr: string, res:any, mainIterations: number): void | number => {
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
                            runOctave(adapterLon, adapterLat, receiverLon, receiverLat, fName, height, frequencyStr, res, mainIterations);
                            // return 1;
                        }, 2000);
                    }
                    if(globalProcessCounter >= ITERATIONS) {
                        res.status(200).send("Wielki sukces");
                        globalProcessCounter = -1;
                        ls1.kill()
                        return 1;
                    }
                }
                console.log(`child process exited with code ${code}`);
            })
        }
}

}

router.post('/send-all/', async (req: Request, res: Response) => {
    try {
        const coordinatesArray = req.body.data;
        const adapterLon = req.body.adapter.longitude;
        const adapterLat = req.body.adapter.latitude;
        const height = req.body.adapter.height;
        const numberOfPost = req.body.postNumber;
        const fName = req.body.fileName;
        const dataFactor = req.body.dataFactor;
        const frequency = Number(req.body.frequency)/100;
        const frequencyStr = frequency.toString();
        const receiverLon = req.body.data[0].receiver.longitude;
        const receiverLat = req.body.data[0].receiver.latitude;
        const segmentsArray: Array<Array<string>> = [];
        const receiversArray: Array<string> = [];
        const segmentsArrayStr: Array<string> = [];

        const limit = pLimit(20);

        // if(dataFactor > 150) {
        //     ITERATIONS = 150;
        //   }
        //   else if(dataFactor > 300) {
        //     ITERATIONS = 300;
        //   }


        for (let i = 0; i < ITERATIONS; i++) {
            segmentsArray.push([]);
            segmentsArrayStr.push('');
        }

        globalStorage.push(...coordinatesArray);

        //----------------------------------------------
        if(+numberOfPost === 1) {
            const filteredCoordintesArray = globalStorage.filter((coords: SegmentResultType) => coords.coordinates.length > 5);

            const notInlcudedCoordintesArray = globalStorage.filter((coords: SegmentResultType) => coords.coordinates.length <= 5);
            notInlcudedCoordintesArray.push({
                coordinates: [],
                receiver: {
                  longitude: adapterLon,
                  latitude: adapterLat
                }
            })

            const notIncludedReceivers = notInlcudedCoordintesArray.map(e => e.receiver);

            const notInlcudedCoordintesReceivers = JSON.stringify(notIncludedReceivers);

            fs.writeFile('otherCoords.json', notInlcudedCoordintesReceivers, (err:string) => {
                if (err) {
                    throw err;
                }
                console.log("JSON data is saved.");
            });

            const chunkedFilterArray = chunkArray(filteredCoordintesArray, ITERATIONS, true);
            prepareProfileData(chunkedFilterArray, receiversArray, segmentsArray, segmentsArrayStr)

            const writeToReceiversPromises: Array<unknown> = [];
            const writeToProfilePromises: Array<unknown> = [];

            for (let j = 0; j < ITERATIONS; j++) {
            // let async_queue = Array(ITERATIONS).fill(my_task);

                limit(() => writeToReceiversPromises.push(writeToReceiverFile(j, receiversArray[j])));
            }

            for (let j = 0; j < ITERATIONS; j++) {
                limit(() => writeToProfilePromises.push(writeToProfileFile(j, segmentsArrayStr[j])));
            }

            if(filteredCoordintesArray.length > 0 ) {
                Promise.all(writeToProfilePromises).then(result => {

                    Promise.all(writeToReceiversPromises).then(async(result) => {
                        if(ITERATIONS > 20) {
                            const mainIterations = ITERATIONS / 50;
                            maxProcessCounter = ITERATIONS / 50;
                            globalProcessCounter = 0;
                            runOctave(adapterLon, adapterLat, receiverLon, receiverLat, fName, height, frequencyStr, res, mainIterations);

                        } else {
                        //
                        }
                    });
                });


        } else {
            return res.status(404).json({
                error: "Not enough points.",
            });
        }
    } else {
         res.status(200).json({
            message: "Success",
        });
    }

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
});



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

export default router;
