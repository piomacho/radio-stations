import { Request, Response, Router } from 'express';
import superagent from 'superagent';
import Keys from "../keys";


const fs = require('fs');
const xl = require('excel4node');

const wb = new xl.Workbook();

const ws = wb.addWorksheet('Sheet 1');

const router = Router();

router.get('/all/:coordinates', async (req: Request, res: Response) => {
    try {
        const coordinates = req.params.coordinates;
        superagent.get(`https://maps.googleapis.com/maps/api/elevation/json?locations=${coordinates}&key=${Keys.elevationKey}`).end((err, response) => {
        return res.send(response.body.results);
    });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
});

router.post('/excel-send', async (req: Request, res: Response) => {
    try {
        const coordinates = req.body.coordinates;
        const coordinatesGMaps = req.body.coordinatesGMaps;

        ws.cell(1,1).string("Open Elevation");
        ws.cell(1,2).string("Google Maps");

        for (let i = 0; i < coordinatesGMaps.length; i++) {
            ws.cell(i + 2, 1).number(coordinates[i]);
            ws.cell(i + 2, 2).number(coordinatesGMaps[i]);
        }

        wb.write(`prosta.xlsx`);
        return res.status(200).json({
            message: "Success",
        });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
});

// api/excel/send/

export default router;
