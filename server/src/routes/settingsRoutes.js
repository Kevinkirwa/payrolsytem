import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { getKraSettings, updateKraSettings, testKraConnection } from '../controllers/settingsController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/kra', getKraSettings);
router.put('/kra', updateKraSettings);
router.post('/kra/test', testKraConnection);

export default router;