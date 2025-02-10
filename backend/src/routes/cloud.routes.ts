import { Router } from 'express';
import { CloudService } from '../services/cloud.service';

const router = Router();
const cloudService = new CloudService();

// 获取资源到期信息
router.get('/resources/expiry', async (req, res) => {
  try {
    const { days, order } = req.query;
    const resources = await cloudService.getExpiryResources({
      remainingDays: days ? parseInt(days as string) : undefined,
      orderBy: order === 'desc' ? 'desc' : 'asc'
    });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch expiry resources', 
      details: error?.message || 'Unknown error' 
    });
  }
});

// 获取账户余额
router.get('/accounts/balances', async (req, res) => {
  try {
    const balances = await cloudService.getAccountBalances();
    res.json(balances);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch account balances', 
      details: error?.message || 'Unknown error' 
    });
  }
});

// 获取账单明细
router.get('/bills/details', async (req, res) => {
  try {
    const bills = await cloudService.getBillingDetails();
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch billing details', 
      details: error?.message || 'Unknown error' 
    });
  }
});

export default router; 