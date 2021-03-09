import { Request, Response, Router } from 'express';
const path = require("path");
const { execFile } = require("child_process");
const { uploadFile } = require('../../storageBucketFunctions.js');
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');
export interface CoordinatesType {
    lat: number;
    e: number;
    lng: number;
    d: number;
}
interface CoordinatesOnePointType {
    latitude: number;
    elevation: number;
    longitude: number;
    distance: number;
}
export interface CornersType {
    maxLongMaxLat: {lat: number, lng: number}
    maxLongMinLat: {lat: number, lng: number}
    minLongMaxLat: {lat: number, lng: number}
    minLongMinLat: {lat: number, lng: number}

}
interface ElevationSegmentType {
    lat: number,
    lng: number,
    e: number,
    d: number
  }

  interface SegmentResultType {
    c: Array<ElevationSegmentType>
    r: {
      lng: number,
      lat: number
    }
  }


const router = Router();


const formatCoordinates = (coords: any) => {
    return coords.map((c: CoordinatesOnePointType) => {
         return  `${c.distance.toString().replace(',', '.')} ${c.elevation.toString().replace(',', '.')} 4;`;
     });
 };

router.post('/send/', async (req: Request, res: Response) => {
    try {
        const coordinates1 = formatCoordinates(req.body.coordinates);
        const adapterLon = req.body.adapter.longitude;
        const adapterLat = req.body.adapter.latitude;
        const height = req.body.adapter.height;
        const receiverLon = req.body.receiver.longitude;
        const receiverLat = req.body.receiver.latitude;
        const fName = req.body.fileName;
        const frequency = req.body.adapter.frequency;

        fs.writeFile('./validation_results/prof_b2iseac.m', `function [d,h,z] = prof_b2iseac()\r\na=[ ...\r\n${coordinates1.join("\r\n")}];\r\nd = a(:,1);\r\n
        h = a(:,2);\r\n
        z = a(:,3);\r\n
        \r\n
        end`, function (err: any) {
          if (err) return console.log(err);
          const ls = execFile("octave", ["-i", "--persist", "validate_p2001_b2iseac.m", adapterLon, adapterLat, receiverLon, receiverLat, fName, +height, frequency]);

          ls.stdout.on("data", (data: string) => {
              console.log(data);

              setTimeout(
                () => {
                    //@ts-ignore
                    req.app.io.emit("finishXlsProcessing", "Zakończono !");
                },
                4000
              );

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

router.get('/upload-xls/:id', async (req: Request, res: Response) => {
    try {
        const xlsName = req.params.id;
        console.log("xls ",xlsName)
        try {
            const storage = new Storage({keyFilename: path.join(__dirname, "../../magmapy-49829cb5b2d7.json"), projectId: 'magmapy'});
            const bucketName = 'klm-map-storage';
            //@ts-ignore
            uploadFile(storage, bucketName, path.join(__dirname, `../../validation_results/${xlsName}.xlsx`)).catch(console.error);


            return res.status(200).json({
                msg: "Uploaded"
            });


    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
} catch (err) {
    return res.status(404).json({
        error: err.message,
    });
}
});

export default router;
