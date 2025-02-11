import { Request, Response } from 'express';
import { CloudService } from '../services/cloud.service';
import { SyncService } from '../services/sync.service';

export class CloudController {
  private cloudService: CloudService;
  private syncService: SyncService;

  constructor() {
    this.cloudService = new CloudService();
    this.syncService = new SyncService();
  }

  getExpiryResources = async (req: Request, res: Response) => {
    try {
      const { days, order } = req.query;
      const resources = await this.cloudService.getExpiryResources({
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
  };

  getAccountBalances = async (req: Request, res: Response) => {
    try {
      const balances = await this.cloudService.getAccountBalances();
      res.json(balances);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch account balances',
        details: error?.message || 'Unknown error'
      });
    }
  };

  getBillingDetails = async (req: Request, res: Response) => {
    try {
      const bills = await this.cloudService.getBillingDetails();
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch billing details',
        details: error?.message || 'Unknown error'
      });
    }
  };

  updateResourceRemark = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { remark } = req.body;

      if (!id) {
        return res.status(400).json({
          error: 'Missing resource ID',
          details: 'Resource ID is required'
        });
      }

      await this.cloudService.updateResourceRemark(parseInt(id), remark);
      res.json({ message: 'Resource remark updated successfully' });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to update resource remark',
        details: error?.message || 'Unknown error'
      });
    }
  };

  syncData = async (req: Request, res: Response) => {
    try {
      await this.syncService.syncAll();
      res.json({ message: 'Data synchronization completed successfully' });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to sync data',
        details: error?.message || 'Unknown error'
      });
    }
  };
} 