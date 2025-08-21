import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { listLoans, createLoan, updateLoan, closeLoan } from '../controllers/loanController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/', listLoans);
router.post('/', createLoan);
router.put('/:id', updateLoan);
router.post('/:id/close', closeLoan);

export default router;