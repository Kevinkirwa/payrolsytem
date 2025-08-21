import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = Router();

router.use(verifyJwt);

router.get('/', requireRole('admin'), listEmployees);
router.get('/:id', requireRole('admin'), getEmployee);
router.post('/', requireRole('admin'), createEmployee);
router.put('/:id', requireRole('admin'), updateEmployee);
router.delete('/:id', requireRole('admin'), deleteEmployee);

export default router;