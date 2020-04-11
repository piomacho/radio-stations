import { Router } from 'express';
import StationsRouter from './Stations';
import AdaptersRouter from './Adapters';
import GMapsRouter from './GMapsPoints';
import ExportRouter from './OctaveExport';

const router = Router();

router.use('/stations', StationsRouter);
router.use('/adapters', AdaptersRouter);
router.use('/gmaps', GMapsRouter);
router.use('/export-octave', ExportRouter);

export default router;
