import { Router } from 'express';
import { verifyJwt, requireRole, requirePermission } from '../middleware/auth.js';
import { runPayrollForAll, listRuns, getRun, listRecords, getPayslipJson, preparePayroll, approveRun } from '../controllers/payrollController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.post('/prepare', requirePermission('payroll.prepare'), preparePayroll);
router.post('/approve/:runId', requirePermission('payroll.approve'), approveRun);
router.post('/run', runPayrollForAll);
router.get('/runs', listRuns);
router.get('/runs/:id', getRun);
router.get('/records', listRecords);
router.get('/payslip/:employeeId', getPayslipJson);

export default router;