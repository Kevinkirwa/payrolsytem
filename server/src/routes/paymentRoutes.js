import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { disburseRun, disburseRecord } from '../controllers/paymentController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.post('/run/:runId/disburse', disburseRun);
router.post('/record/:recordId/disburse', disburseRecord);

export default router;