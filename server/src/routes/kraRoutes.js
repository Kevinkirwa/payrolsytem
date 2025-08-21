import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { p9Pdf, p10Csv, p10aCsv, submitP10ToKra, submitP10AToKra, submitP9ToKra } from '../controllers/kraController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/p9.pdf', p9Pdf);
router.get('/p10.csv', p10Csv);
router.get('/p10a.csv', p10aCsv);
router.post('/submit/p10', submitP10ToKra);
router.post('/submit/p10a', submitP10AToKra);
router.post('/submit/p9', submitP9ToKra);

export default router;