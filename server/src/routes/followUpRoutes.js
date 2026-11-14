import { Router } from 'express';
import { createFollowUp } from '../controllers/followUpController.js';

const router = Router();

router.post('/', createFollowUp);

export default router;
