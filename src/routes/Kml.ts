import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/get-kml/:id', async (req: Request, res: Response) => {
    try {
        const kmlName = req.params.id;
        try {
            await fs.readdir(path.join(__dirname, '../kml/'),
            (err: NodeJS.ErrnoException | null, files: Array<string>) => {
               files && files.forEach(file => {
                 if(file === `${kmlName}.kml`) {
                   return res.status(200).sendFile(`${kmlName}.kml`, { root: './src/kml' });
                 }
               })
               return false;
           })

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