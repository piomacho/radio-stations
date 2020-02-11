import { Request, Response, Router } from 'express';
import superagent from 'superagent';
import { getFieldsFromObject } from 'src/common/global';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
    try {
        superagent.get('https://mapy.radiopolska.pl/api/programAll/PL').end((err, response) => {
        const programArray = getFieldsFromObject(response.body.data, ['nazwa', 'id_program']);
        return res.send(programArray);
    });
        
    } catch (err) {
        // logger.error(err.message, err);
        return res.status(404).json({
            error: err.message,
        });
    }
        // res.send({ express: 'Hello From Express' });

});

export default router;
