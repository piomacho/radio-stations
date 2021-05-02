import { Request, Response, Router } from 'express';
import superagent from 'superagent';
import { xml2js } from 'xml-js';

const router = Router();

router.get('/image/:mapahash', async (req: Request, res: Response) => {
    try {
        const id = req.params.mapahash;
        superagent.get(`https://mapy.radiopolska.pl/files/get/fm-std/${id}.png`).end((err, response) => {
        return res.send(response);
    });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});

router.get('/image-new/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        superagent.get(`https://mapy.radiopolska.pl/files/get/fm-std/${id}.png`).end((err, response) => {
        return res.send(response);
    });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});

router.get('/kml/:mapahash', async (req: Request, res: Response) => {
    try {
        const id = req.params.mapahash;
        superagent.get(`https://mapy.radiopolska.pl/files/get/fm-std/${id}.kml`).buffer()
        .type('kml')
        .end((err, response) => {
           res.send(response);
        });
    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});


router.get('/kml-new/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        superagent.get(`https://storage.googleapis.com/klm-map-storage/${id}.kml`).buffer()
        .type('kml')
        .end((err, response) => {
           res.send(response);
        });
    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});


export default router;
