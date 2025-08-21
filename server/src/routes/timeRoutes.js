import { Router } from 'express';
import { verifyJwt, requireRole } from '../middleware/auth.js';
import { upsertTimeEntry, listTimeEntries, myTimeEntries } from '../controllers/timeController.js';

const router = Router();

router.use(verifyJwt);

router.get('/my', myTimeEntries);
router.use(requireRole('admin'));
router.get('/', listTimeEntries);
router.post('/', upsertTimeEntry);

export default router;