import { Request, Response, Router } from 'express';
import superagent from 'superagent';
import { getFieldsFromObject } from 'src/common/global';
import Keys from "../keys";

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

export default router;
