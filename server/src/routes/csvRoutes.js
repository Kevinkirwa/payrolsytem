import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { exportEmployeesCsv, importEmployeesCsv } from '../controllers/employeeCsvController.js';

const router = Router();

router.use(verifyJwt, requireRole('admin'));

router.get('/employees.csv', exportEmployeesCsv);
router.post('/employees/import', importEmployeesCsv);

export default router;