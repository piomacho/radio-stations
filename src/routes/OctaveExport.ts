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

const router = Router();

const formatCoordinates = (coords: any) => {

   return coords.map((c: CoordinatesType) => {
        return [c.latitude.toString().replace(',', '.'), c.longitude.toString().replace(',', '.'), c.elevation.toString().replace(',', '.'), c.distance.toString().replace(',', '.') ];
    });
};

const formatCoordinates1 = (coords: any) => {
    return coords.map((c: CoordinatesType) => {
         return  `${c.distance.toString().replace(',', '.')} ${c.elevation.toString().replace(',', '.')} 4`;
     });
 };

router.post('/send/', async (req: Request, res: Response) => {
    try {
        const coordinates1 = formatCoordinates1(req.body.coordinates);
        const coordinates = formatCoordinates(req.body.coordinates);
        const adapterLon = req.body.adapter.longitude;
        const adapterLat = req.body.adapter.latitude;
        const height = req.body.adapter.height;
        const receiverLon = req.body.receiver.longitude;
        const receiverLat = req.body.receiver.latitude;
        const fName = req.body.fileName;

        fs.writeFile('./validation_results/prof_b2iseac.m', `function [d,h,z] = prof_b2iseac()\r\na=[ ...\r\n${coordinates1.join("\r\n")}];\r\nd = a(:,1);\r\n
        h = a(:,2);\r\n
        z = a(:,3);\r\n
        \r\n
        end`, function (err: any) {
          if (err) return console.log(err);
          const ls = execFile("octave", ["-i", "--persist", "validate_p2001_b2iseac.m", adapterLon, adapterLat, receiverLon, receiverLat, fName, height]);

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

export default router;
