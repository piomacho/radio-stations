import { Router } from 'express';
import StationsRouter from './Stations';
import AdaptersRouter from './Adapters';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/stations', StationsRouter);
router.use('/adapters', AdaptersRouter);

// Export the base-router
export default router;
