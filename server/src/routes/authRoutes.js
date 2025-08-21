import { Router } from 'express';
import { login, logout, me, seedAdmin } from '../controllers/authController.js';
import { verifyJwt } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyJwt, me);
router.post('/seed-admin', seedAdmin);

export default router;