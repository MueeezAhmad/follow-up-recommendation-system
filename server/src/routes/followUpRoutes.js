import { Router } from 'express';
import { completeFollowUp, createFollowUp, deleteFollowUp, getFollowUps, updateFollowUp } from '../controllers/followUpController.js';

const router = Router();

router.get('/', getFollowUps);
router.post('/', createFollowUp);
router.put('/:id', updateFollowUp);
router.patch('/:id/status', completeFollowUp);
router.delete('/:id', deleteFollowUp);

export default router;
