import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { monthlySummary, monthlySummaryCsv, monthlySummaryPdf } from '../controllers/reportController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/monthly', monthlySummary);
router.get('/monthly.csv', monthlySummaryCsv);
router.get('/monthly.pdf', monthlySummaryPdf);

export default router;