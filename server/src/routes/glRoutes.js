import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { glExportCsv } from '../controllers/glController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/export.csv', glExportCsv);

export default router;