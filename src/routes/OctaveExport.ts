import { Request, Response, Router } from 'express';
// const { exec } = require("child_process");
const { spawn, execFile } = require("child_process");

const fs = require('fs');
const xl = require('excel4node');

// Create a new instance of a Workbook class
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


router.post('/send-all/', async (req: Request, res: Response) => {
    try {

        // MATLAB
        // B = cat(3, [2 8; 0 5], [1 3; 7 9])
        // const coordinates1 = formatCoordinates1(req.body.coordinates);
        const coordinatesArray = req.body.data;
        const adapterLon = req.body.adapter.longitude;
        const adapterLat = req.body.adapter.latitude;
        const height = req.body.adapter.height;

        const fName = req.body.fileName;
        const frequency = Number(req.body.frequency)/100;

        const frequencyStr = frequency.toString();



        const receiverLon = req.body.data[0].receiver.longitude;
        const receiverLat = req.body.data[0].receiver.latitude;
        const segmentsArray: Array<string> = [];
        let receivers = '';

        // Coordinates length must be higher than 10

        const filteredCoordintesArray = coordinatesArray.filter((coords: SegmentResultType) => coords.coordinates.length > 10)

        filteredCoordintesArray.map((c: SegmentResultType) => {
            receivers += `${c.receiver.latitude},${c.receiver.longitude};`
        });



        filteredCoordintesArray.map((coordinateData: SegmentResultType) => {
            let segment = ' ';
            coordinateData.coordinates.map((c: CoordinatesType, iterator:number) => {
                // console.log("iterator ", iterator,"====>", c)
                // segment='\n';
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
        const receiversArrayStr = `[${receivers}]`;


        // segmentsArray.push(
        //     ` 0 109 4;
        //     108.00357002869112 115 4;
        //     216.0071400573855 118 4;
        //     250 119 4;
        //     266 119 4;
        //     280 111 4;
        //     300 101 4;
        //     330 111 4;
        //     350 111 4;
        //     370 123 4;
        //     380 102 4;
        //     400 104 4;`
        // );


        // segmentsArray.push(
        //     ` 0 109 4;
        //     108.00357002869112 115 4;
        //     216.0071400573855 118 4;
        //     250 119 4;
        //     266 119 4;
        //     267 102 4;
        //     268 104 4;
        //     276 119 4;
        //     280 111 4;
        //     300 101 4;
        //     330 111 4;
        //     350 111 4;
        //     370 123 4;
        //     380 102 4;
        //     400 104 4;
        //     566 119 4;
        //     580 111 4;
        //     600 101 4;
        //     630 111 4;
        //     650 111 4;
        //     670 123 4;
        //     680 102 4;
        //     700 104 4;
        //     766 119 4;
        //     780 111 4;
        //     800 101 4;
        //     830 111 4;
        //     850 111 4;
        //     870 123 4;`
        // );

        let segmentsArrayStr = '';

        for(let i = 0; i <  segmentsArray.length; i++) {
            if(i !== segmentsArray.length -1) {
                segmentsArrayStr += `[${segmentsArray[i]}]; `;
            } else {
                segmentsArrayStr += `[${segmentsArray[i]}];`;
            }
        }

        fs.writeFile('./validation_results/prof_b2iseac2.m', `function f = prof_b2iseac2()\r\nf={${segmentsArrayStr}};\r\n
        end`, function (err: any) {

        const ls = execFile("octave", ["-i", "--persist", "validate-new.m", adapterLon, adapterLat, receiverLon, receiverLat, fName, height, frequencyStr, receivers]);

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

            return res.status(200).json({
                message: "Success",
            });
        });
    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
    // }
});

export default router;
