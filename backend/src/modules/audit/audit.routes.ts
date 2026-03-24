import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getAuditLogs } from './audit.service';
import { success } from '../../utils/apiResponse';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const result = await getAuditLogs(req.query);
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

export default router;
