import { Request, Response, Router } from 'express';
// const { exec } = require("child_process");
import {chunkArray} from './chunkArray';
const { spawn, execFile } = require("child_process");

const fs = require('fs');
const xl = require('excel4node');

// Create a new instance of a Workbook class
const wb = new xl.Workbook();

const ws = wb.addWorksheet('Sheet 1');

// global.myNumber;

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

const formatCoordinates = (coords: any) => {

   return coords.map((c: CoordinatesType) => {
        return [c.latitude.toString().replace(',', '.'), c.longitude.toString().replace(',', '.'), c.elevation.toString().replace(',', '.'), c.distance.toString().replace(',', '.') ];
    });
};

const formatCoordinates1 = (coords: any) => {
    return coords.map((c: CoordinatesType) => {
         return  `${c.distance.toString().replace(',', '.')} ${c.elevation.toString().replace(',', '.')} 4;`;
     });
 };

router.post('/send/', async (req: Request, res: Response) => {
    try {
        const coordinates1 = formatCoordinates1(req.body.coordinates);
        // const coordinates = formatCoordinates(req.body.coordinates);
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
        const segmentsArray: Array<string> = [];
        const segmentsArray2: Array<string> = [];
        const segmentsArray3: Array<string> = [];
        const segmentsArray4: Array<string> = [];
        const receiversArray: Array<string> = [];
        let receivers = '';
        let receivers2 = '';
        let receivers3 = '';
        let receivers4 = '';

        // Coordinates length must be higher than 10



        globalStorage.push(...coordinatesArray);


        //----------------------------------------------
        if(+numberOfPost === 1) {

            const filteredCoordintesArray = globalStorage.filter((coords: SegmentResultType) => coords.coordinates.length > 10);
            globalStorage = [];

            console.log("filter -- ", filteredCoordintesArray.length);

            const chunkedFilterArray = chunkArray(filteredCoordintesArray, 4, true);

            chunkedFilterArray[0].map((c: SegmentResultType) => {
                let receivers123= ' ';
                receivers123 += `[${c.receiver.latitude} ${c.receiver.longitude}];`
                receivers123 += '\n';

                if(receivers123 !== '' && receivers123 !== '\n') {
                    receivers += receivers123;
                }
            });


            chunkedFilterArray[1].map((c: SegmentResultType) => {
                let receivers123= ' ';
                receivers123 += `[${c.receiver.latitude} ${c.receiver.longitude}];`
                receivers123 += '\n';

                if(receivers123 !== '' && receivers123 !== '\n') {
                    receivers2 += receivers123;
                }
            });



            chunkedFilterArray[2].map((c: SegmentResultType) => {
                let receivers123= ' ';
                receivers123 += `[${c.receiver.latitude} ${c.receiver.longitude}];`
                receivers123 += '\n';

                if(receivers123 !== '' && receivers123 !== '\n') {
                    receivers3 += receivers123;
                }
            });



            chunkedFilterArray[3].map((c: SegmentResultType) => {
                let receivers123= ' ';
                receivers123 += `[${c.receiver.latitude} ${c.receiver.longitude}];`
                receivers123 += '\n';

                if(receivers123 !== '' && receivers123 !== '\n') {
                    receivers4 += receivers123;
                }
            });




            chunkedFilterArray[0].map((coordinateData: SegmentResultType) => {
                let segment = ' ';
                coordinateData.coordinates.map((c: CoordinatesType, iterator:number) => {
                    if(iterator < coordinateData.coordinates.length - 1 && iterator !== 0){
                        segment += `\t    ${c.distance} ${c.elevation} 4;`;
                        segment += '\n';
                    } else if(iterator === 0) {
                        segment += `${c.distance} ${c.elevation} 4;\n`;
                    } else {
                        segment += `\t    ${c.distance} ${c.elevation} 4;`
                    }

                })
                if(segment !== '' && segment !== '\n') {
                    segmentsArray.push(segment);
                }
            });
            chunkedFilterArray[1].map((coordinateData: SegmentResultType) => {
                let segment = ' ';
                coordinateData.coordinates.map((c: CoordinatesType, iterator:number) => {
                    if(iterator < coordinateData.coordinates.length - 1 && iterator !== 0){
                        segment += `\t    ${c.distance} ${c.elevation} 4;`;
                        segment += '\n';
                    } else if(iterator === 0) {
                        segment += `${c.distance} ${c.elevation} 4;\n`;
                    } else {
                        segment += `\t    ${c.distance} ${c.elevation} 4;`
                    }

                })
                if(segment !== '' && segment !== '\n') {
                    segmentsArray2.push(segment);
                }
            });
            chunkedFilterArray[2].map((coordinateData: SegmentResultType) => {
                let segment = ' ';
                coordinateData.coordinates.map((c: CoordinatesType, iterator:number) => {
                    if(iterator < coordinateData.coordinates.length - 1 && iterator !== 0){
                        segment += `\t    ${c.distance} ${c.elevation} 4;`;
                        segment += '\n';
                    } else if(iterator === 0) {
                        segment += `${c.distance} ${c.elevation} 4;\n`;
                    } else {
                        segment += `\t    ${c.distance} ${c.elevation} 4;`
                    }

                })
                if(segment !== '' && segment !== '\n') {
                    segmentsArray3.push(segment);
                }
            });
            chunkedFilterArray[3].map((coordinateData: SegmentResultType) => {
                let segment = ' ';
                coordinateData.coordinates.map((c: CoordinatesType, iterator:number) => {
                    if(iterator < coordinateData.coordinates.length - 1 && iterator !== 0){
                        segment += `\t    ${c.distance} ${c.elevation} 4;`;
                        segment += '\n';
                    } else if(iterator === 0) {
                        segment += `${c.distance} ${c.elevation} 4;\n`;
                    } else {
                        segment += `\t    ${c.distance} ${c.elevation} 4;`
                    }

                })
                if(segment !== '' && segment !== '\n') {
                    segmentsArray4.push(segment);
                }
            });



            let segmentsArrayStr = '';
            let segmentsArrayStr2 = '';
            let segmentsArrayStr3 = '';
            let segmentsArrayStr4 = '';

            for(let i = 0; i <  segmentsArray.length; i++) {
                if(i !== segmentsArray.length -1) {
                    segmentsArrayStr += `[${segmentsArray[i]}]; `;
                } else {
                    segmentsArrayStr += `[${segmentsArray[i]}];`;
                }
            }
            for(let i = 0; i <  segmentsArray2.length; i++) {
                if(i !== segmentsArray2.length -1) {
                    segmentsArrayStr2 += `[${segmentsArray2[i]}]; `;
                } else {
                    segmentsArrayStr2 += `[${segmentsArray2[i]}];`;
                }
            }
            for(let i = 0; i <  segmentsArray3.length; i++) {
                if(i !== segmentsArray3.length -1) {
                    segmentsArrayStr3 += `[${segmentsArray3[i]}]; `;
                } else {
                    segmentsArrayStr3 += `[${segmentsArray3[i]}];`;
                }
            }
            for(let i = 0; i <  segmentsArray4.length; i++) {
                if(i !== segmentsArray4.length -1) {
                    segmentsArrayStr4 += `[${segmentsArray4[i]}]; `;
                } else {
                    segmentsArrayStr4 += `[${segmentsArray4[i]}];`;
                }
            }

            if(filteredCoordintesArray.length > 0 ){
                fs.writeFile('./validation_results/prof_1.m', `function f = prof_1()\r\nf={${segmentsArrayStr}};\r\n
                end`, function (err: any) {
                    fs.writeFile('./validation_results/prof_2.m', `function f = prof_2()\r\nf={${segmentsArrayStr2}};\r\n
                    end`, function (err: any) {
                        fs.writeFile('./validation_results/prof_3.m', `function f = prof_3()\r\nf={${segmentsArrayStr3}};\r\n
                        end`, function (err: any) {
                            fs.writeFile('./validation_results/prof_4.m', `function f = prof_4()\r\nf={${segmentsArrayStr4}};\r\n
                            end`, function (err: any) {
                                    fs.writeFile('./validation_results/get_receivers1.m', `function f = get_receivers1()\r\nf={${receivers}};\r\n
                                    end`, function (err: any) {
                                        fs.writeFile('./validation_results/get_receivers2.m', `function f = get_receivers2()\r\nf={${receivers2}};\r\n
                                        end`, function (err: any) {

                                            fs.writeFile('./validation_results/get_receivers3.m', `function f = get_receivers3()\r\nf={${receivers3}};\r\n
                                            end`, function (err: any) {

                                                fs.writeFile('./validation_results/get_receivers4.m', `function f = get_receivers4()\r\nf={${receivers4}};\r\n
                                                end`, function (err: any) {


                                                        const ls1 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}1`, height, frequencyStr, 1]);

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

                                                            // return res.status(200).json({
                                                            //     message: "Success",
                                                            // });
                                                    });

                                                    const ls2 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}2`, height, frequencyStr, 2]);

                                                    ls2.stdout.on("data", (data: string) => {
                                                        console.log(data);
                                                    });

                                                    ls2.stderr.on("data", (data: string) => {
                                                        console.log(`stderr: ${data}`);
                                                    });

                                                    ls2.on('error', (error: { message: string }) => {
                                                        console.log(`error: ${error.message}`);
                                                    });

                                                    ls2.on("close", (code: string) => {
                                                        console.log(`child process exited with code ${code}`);
                                                    })

                                                    // return res.status(200).json({
                                                    //     message: "Success",
                                                    // });
                                            });

                                            const ls3 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, `${fName}3`, height, frequencyStr, 3]);

                                            ls3.stdout.on("data", (data: string) => {
                                                console.log(data);
                                            });

                                            ls3.stderr.on("data", (data: string) => {
                                                console.log(`stderr: ${data}`);
                                            });

                                            ls3.on('error', (error: { message: string }) => {
                                                console.log(`error: ${error.message}`);
                                            });

                                            ls3.on("close", (code: string) => {
                                                console.log(`child process exited with code ${code}`);
                                            })

                                            // return res.status(200).json({
                                            //     message: "Success",
                                            // });
                                    });

                                    const ls4 = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat,`${fName}4`, height, frequencyStr, 4]);

                                    ls4.stdout.on("data", (data: string) => {
                                        console.log(data);
                                    });

                                    ls4.stderr.on("data", (data: string) => {
                                        console.log(`stderr: ${data}`);
                                    });

                                    ls4.on('error', (error: { message: string }) => {
                                        console.log(`error: ${error.message}`);
                                    });

                                    ls4.on("close", (code: string) => {
                                        console.log(`child process exited with code ${code}`);
                                    })

                                    return res.status(200).json({
                                        message: "Success",
                                    });
                            });
                });
            })
        });
    });
        } else {
            console.log("JAPA");
            // return res.status(404).json({
            //     error: "Not enough points.",
            // });
        }
    } else {
        // return 1
         res.status(200).json({
            message: "Success",
        });
    }

    } catch (err) {
        console.log("JAPA err", err);
        // return res.status(404).json({
        //     error: err.message,
        // });
    }
    // }
});

export default router;
