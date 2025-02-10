import { Request, Response } from 'express';
import { CloudService } from '../services/cloud.service';

const cloudService = new CloudService();

export class CloudController {
  async getExpiryResources(req: Request, res: Response) {
    try {
      const resources = await cloudService.getExpiryResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expiry resources' });
    }
  }

  async getAccountBalances(req: Request, res: Response) {
    try {
      const balances = await cloudService.getAccountBalances();
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch account balances' });
    }
  }

  async getBillingDetails(req: Request, res: Response) {
    try {
      const bills = await cloudService.getBillingDetails();
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch billing details' });
    }
  }
} 