import { Router } from 'express';
import { CloudService } from '../services/cloud.service';
import { CloudController } from '../controllers/cloud.controller';

const router = Router();
const cloudService = new CloudService();
const cloudController = new CloudController();

// 获取资源到期信息
router.get('/resources/expiry', cloudController.getExpiryResources);

// 获取账户余额
router.get('/accounts/balances', cloudController.getAccountBalances);

// 获取账单明细
router.get('/bills/details', cloudController.getBillingDetails);

// 更新资源备注
router.put('/resources/:id/remark', cloudController.updateResourceRemark);

// 添加手动同步接口
router.post('/sync', cloudController.syncData);

export default router; 