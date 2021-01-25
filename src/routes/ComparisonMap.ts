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

router.get('/kml/:mapahash', async (req: Request, res: Response) => {
    try {
        const id = req.params.mapahash;
        superagent.get(`https://mapy.radiopolska.pl/files/get/fm-std/${id}.kml`).buffer()
        .type('kml')
        .end((err, response) => {
            //@ts-ignore
            // console.log(" 000  ", res.text)
            // const kml = xml2js(res.text, { ignoreAttributes: true, compact: true })
           res.send(response);
        });
    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});


export default router;
