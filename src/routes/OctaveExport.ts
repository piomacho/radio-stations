import { Request, Response, Router } from 'express';
const fs = require('fs');
var json2xls = require('json2xls');

export interface CoordinatesType {
    latitude: number;
    elevation: number;
    longitude: number;
}

const router = Router();

const formatCoordinates = (coords: any) => {

   return coords.map((c: CoordinatesType) => {
        return [c.latitude.toString().replace(',', '.'), c.longitude.toString().replace(',', '.'), c.elevation.toString().replace(',', '.') ];
    });
};

router.post('/send/', async (req: Request, res: Response) => {
    try {
        const coordinates = formatCoordinates(req.body.coordinates);
        const xls = json2xls(coordinates);
        fs.writeFileSync(`${req.body.fileName}.xlsx`, xls, 'binary');
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
            // [data, text] = xlsread('dat2a.xlsx');
