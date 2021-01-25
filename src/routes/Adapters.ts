import { Request, Response, Router } from 'express';
import superagent from 'superagent';
import { getFieldsFromObject } from 'src/common/global';

const router = Router();

router.get('/all/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        superagent.get(`https://mapy.radiopolska.pl/api/transmitterByProgId/PL/${id}`).end((err, response) => {
            if(response.body.data.fm) {
                const programArray = getFieldsFromObject(response.body.data.fm, ['obiekt', 'dlugosc', 'szerokosc', 'id_obiekt', 'wys_npm', 'czestotliwosc', 'id_antena', 'id_nadajnik', 'id_program', '_mapahash']);
                return res.send(programArray);
            }

    });

    } catch (err) {
        return res.status(404).json({
            error: err.message,
        });
    }

});

export default router;
