import { Router } from 'express';
import * as grnController from './grn.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', grnController.getAll);
router.post('/', grnController.create);
router.patch('/:id/qa-decision', authorize('QA_MANAGER', 'ADMIN'), grnController.qaDecision);
router.get('/asn', grnController.getASNs);
router.post('/asn', grnController.createASN);

export default router;
