import { Router } from 'express';
import StationsRouter from './Stations';
import AdaptersRouter from './Adapters';
import GMapsRouter from './GMapsPoints';
import ExportRouter from './OctaveExport';
import CoordinatesRouter from './Coordinates';
import ComparisonMap from './ComparisonMap';
import KmlRouter from './Kml';

const router = Router();

router.use('/stations', StationsRouter);
router.use('/adapters', AdaptersRouter);
router.use('/gmaps', GMapsRouter);
router.use('/export-octave', ExportRouter);
router.use('/coordinates', CoordinatesRouter)
router.use('/comparison-map', ComparisonMap);
router.use('/kml', KmlRouter)

export default router;
