import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { p9Pdf, p10Csv, p10aCsv } from '../controllers/kraController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/p9.pdf', p9Pdf);
router.get('/p10.csv', p10Csv);
router.get('/p10a.csv', p10aCsv);

export default router;