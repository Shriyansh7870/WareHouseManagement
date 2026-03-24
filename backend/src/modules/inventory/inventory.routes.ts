import { Router } from 'express';
import * as inventoryController from './inventory.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.get('/', inventoryController.getAll);
router.get('/alerts/expiry', inventoryController.getExpiryAlerts);
router.get('/:id', inventoryController.getById);
router.post('/', inventoryController.create);
router.patch('/:id', inventoryController.update);
router.post('/adjust', inventoryController.adjust);

export default router;
