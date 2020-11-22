import { Request, Response, Router } from 'express';
// const { exec } = require("child_process");
import {chunkArray} from './chunkArray';
const { spawn, execFile } = require("child_process");

const fs = require('fs');
const xl = require('excel4node');
const wb = new xl.Workbook();

const ws = wb.addWorksheet('Sheet 1');


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

// const formatCoordinates = (coords: any) => {

//    return coords.map((c: CoordinatesType) => {
//         return [c.latitude.toString().replace(',', '.'), c.longitude.toString().replace(',', '.'), c.elevation.toString().replace(',', '.'), c.distance.toString().replace(',', '.') ];
//     });
// };

const formatCoordinates1 = (coords: any) => {
    return coords.map((c: CoordinatesType) => {
         return  `${c.distance.toString().replace(',', '.')} ${c.elevation.toString().replace(',', '.')} 4;`;
     });
 };

const writeReceiversToFile = () => {

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


const runOctave = (adapterLon: number, adapterLat: number, receiverLon: number, receiverLat: number, fName: string, j: number, height: number,  frequencyStr: string) => {

    const ls1 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}${j}`, height, frequencyStr, j]);

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
        console.log(`child process exited with code ${code}`);
    })
}


router.post('/send-all/', async (req: Request, res: Response) => {
    try {
        const coordinatesArray = req.body.data;
        const adapterLon = req.body.adapter.longitude;
        const adapterLat = req.body.adapter.latitude;
        const height = req.body.adapter.height;
        const numberOfPost = req.body.postNumber;
        const fName = req.body.fileName;
        const frequency = Number(req.body.frequency)/100;
        const frequencyStr = frequency.toString();
        const receiverLon = req.body.data[0].receiver.longitude;
        const receiverLat = req.body.data[0].receiver.latitude;
        const segmentsArray: Array<Array<string>> = [];
        const receiversArray: Array<string> = [];
        const segmentsArrayStr: Array<string> = [];

        const ITERATIONS = 4;

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

            const allReceivers = filteredCoordintesArray.map(e => e.receiver);
            const notIncludedReceivers = notInlcudedCoordintesArray.map(e => e.receiver);


            const allReceivers1 =  allReceivers.sort((a, b) => {
                if (a.latitude === b.latitude) {
                   // Price is only important when cities are the same
                   return b.longitude - a.longitude;
                }
                return a.latitude > b.latitude ? -1 : 1;
             })


             const allReceivers2 =  allReceivers1.map((a) => {
                return { latitude: parseFloat((+a.latitude).toFixed(13)), longitude: parseFloat((+a.longitude).toFixed(13))}
             })

            const notInlcudedCoordintesReceivers = JSON.stringify(notIncludedReceivers);

            fs.writeFile('otherCoords.json', notInlcudedCoordintesReceivers, (err:string) => {
                if (err) {
                    throw err;
                }
                console.log("JSON data is saved.");
            });
            fs.writeFile('allValidCords.json', JSON.stringify(allReceivers2), (err:string) => {
                if (err) {
                    throw err;
                }
                globalStorage = [];

                console.log("JSON data all is saved.");
            });
            const chunkedFilterArray = chunkArray(filteredCoordintesArray, ITERATIONS, true);

            for (let i = 0; i < ITERATIONS; i++) {
                let receivers123= ' ';
                chunkedFilterArray[i] && chunkedFilterArray[i].map((c: SegmentResultType) => {
                    // receiversArray.push(receivers123);
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


            const writeToReceiversPromises: Array<unknown> = [];
            const writeToProfilePromises: Array<unknown> = [];

            for (let j = 0; j < ITERATIONS; j++) {
                writeToReceiversPromises.push(writeToReceiverFile(j, receiversArray[j]));
            }

            for (let j = 0; j < ITERATIONS; j++) {
                writeToProfilePromises.push(writeToProfileFile(j, segmentsArrayStr[j]));
            }

            res.status(200).json({
                message: "Success",
            });

            if(filteredCoordintesArray.length > 0 ) {
                Promise.all(writeToProfilePromises).then(result => {

                    Promise.all(writeToReceiversPromises).then(result => {

                        for (let j = 0; j < ITERATIONS; j++) {
                            runOctave(adapterLon, adapterLat, receiverLon, receiverLat, fName, j, height, frequencyStr);
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

export default router;
