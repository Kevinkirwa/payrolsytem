import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { runPayrollForAll, listRuns, getRun, listRecords, getPayslipJson } from '../controllers/payrollController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.post('/run', runPayrollForAll);
router.get('/runs', listRuns);
router.get('/runs/:id', getRun);
router.get('/records', listRecords);
router.get('/payslip/:employeeId', getPayslipJson);

export default router;