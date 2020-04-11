import { Request, Response, Router } from 'express';
const fs = require('fs');

export interface CoordinatesType {
    latitude: number;
    elevation: number;
    longitude: number;
}

const router = Router();

const formatCoordinates = (coords: any) => {

   return coords.map((c: CoordinatesType) => {
        return [c.latitude, c.longitude, c.elevation] + ";";
    });
};

router.post('/send/', async (req: Request, res: Response) => {
    try {
        // const coordinates = req.params.coordinates;
        const coordinates = formatCoordinates(req.body.coordinates).toString().replace(/,/g, ' ');

        fs.writeFile('./elevation-results.csv', coordinates, (err: string) => {
            // throws an error, you could also catch it here
            if (err) throw err;

            // success case, the file was saved
            console.log('Saved to file!');
        });

        return res.send("ok");
    // });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }
});

export default router;
