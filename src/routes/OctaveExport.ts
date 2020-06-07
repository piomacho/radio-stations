import { Request, Response, Router } from 'express';
const fs = require('fs');
const xl = require('excel4node');

// Create a new instance of a Workbook class
const wb = new xl.Workbook();

const ws = wb.addWorksheet('Sheet 1');

const style = wb.createStyle({
    font: {
      color: '#FF0800',
      size: 12,
    },
    numberFormat: '$#,##0.00; ($#,##0.00); -',
  });

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
    // let str = '';
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
        const receiverLon = req.body.receiver.longitude;
        const receiverLat = req.body.receiver.latitude;
        const dataStr =  '';
        // console.log("ppp ", coordinates.join("\r\n"));
        // for (let i = 0; i < coordinates.length; i++) {
        //         datacoordinates[i][3];
        //         ws.cell(9 + i, 2).string(coordinates[i][2]);
        //         ws.cell(9 + i, 3).number(4);
        //     }



        fs.writeFile('test.m', `function [d,h,z] = prof4()\r\na=[ ...\r\n${coordinates1.join("\r\n")};\r\nd = a(:,1);\r\n
        h = a(:,2);\r\n
        z = a(:,3);\r\n
        \r\n
        end`, function (err: any) {
          if (err) return console.log(err);
          console.log('Hello World > helloworld.txt');
        });
        ws.cell(1, 1).string('File').style(style);
        ws.cell(1, 2).string('Profile');
        ws.cell(2, 1).string('Locations');
        ws.cell(2, 2).string('Yes');
        ws.cell(3, 1).string('Coords');
        ws.cell(3, 2).string('LlatDeg');
        ws.cell(3, 1).string('TxCoordE');
        ws.cell(3, 2).number(adapterLat);
        ws.cell(4, 1).string('TxCoordN');
        ws.cell(4, 2).number(adapterLon);
        ws.cell(5, 1).string('RxCoordE');
        ws.cell(5, 2).number(receiverLat);
        ws.cell(6, 1).string('RxCoordN');
        ws.cell(6, 2).number(receiverLon);
        ws.cell(7, 1).string('Data');
        ws.cell(7, 2).string('DHZ');
        ws.cell(8, 1).string('Points');
        ws.cell(8, 2).number(coordinates.length);

        for (let i = 0; i < coordinates.length; i++) {
            ws.cell(9 + i, 1).string(coordinates[i][3]);
            ws.cell(9 + i, 2).string(coordinates[i][2]);
            ws.cell(9 + i, 3).number(4);
        }

        wb.write(`${req.body.fileName}.xlsx`);
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
