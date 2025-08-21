import { Router } from 'express';
import { verifyJwt, allowSelfOrAdmin } from '../middleware/auth.js';
import { getPayslipJson, getPayslipPdf } from '../controllers/payrollController.js';

const router = Router();

router.use(verifyJwt);

router.get('/:employeeId', allowSelfOrAdmin, getPayslipPdf);
router.get('/:employeeId/json', allowSelfOrAdmin, getPayslipJson);

export default router;