import { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
const {Storage} = require('@google-cloud/storage');
const { checkIfFileExists, deleteFile } = require('../../storageBucketFunctions.js');

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

router.get('/check-kml/:id', async (req: Request, res: Response) => {
    try {
        const kmlName = req.params.id;
        try {
            const storage = new Storage({keyFilename: path.join(__dirname, "../../magmapy-49829cb5b2d7.json"), projectId: 'magmapy'});
            const bucketName = 'klm-map-storage';
            const doExists = await checkIfFileExists(storage, bucketName, kmlName);

            return res.send({exists: doExists});


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

router.get('/delete-kml/:id', async (req: Request, res: Response) => {
    try {
        const kmlName = req.params.id;
        try {
            const storage = new Storage({keyFilename: path.join(__dirname, "../../magmapy-49829cb5b2d7.json"), projectId: 'magmapy'});
            const bucketName = 'klm-map-storage';
            deleteFile(storage, bucketName, `${kmlName}.kml`);
            deleteFile(storage, bucketName, `${kmlName}.png`);

            return res.status(200).json({
                msg: "Deleted"
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