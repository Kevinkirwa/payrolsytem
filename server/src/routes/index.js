import { Router } from 'express';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import payrollRoutes from './payrollRoutes.js';
import payslipRoutes from './payslipRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reportRoutes from './reportRoutes.js';
import kraRoutes from './kraRoutes.js';
import csvRoutes from './csvRoutes.js';
import glRoutes from './glRoutes.js';
import timeRoutes from './timeRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/payroll', payrollRoutes);
router.use('/payslip', payslipRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/kra', kraRoutes);
router.use('/csv', csvRoutes);
router.use('/gl', glRoutes);
router.use('/time', timeRoutes);
router.use('/settings', settingsRoutes);
router.use('/loans', (await import('./loanRoutes.js')).default);

export default router;