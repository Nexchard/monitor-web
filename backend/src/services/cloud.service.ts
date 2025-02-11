import { huaweiPool, tencentPool, unifiedPool } from '../config/db.config';
import { ValidationService } from './validation.service';
import { RowDataPacket } from 'mysql2';

interface CloudResource extends RowDataPacket {
  cloud_provider: string;
  account_name: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  project_name: string;
  region: string;
  zone: string;
  expire_time: Date;
  remaining_days: number;
  batch_number: string;
}

interface CloudAccount extends RowDataPacket {
  cloud_provider: string;
  account_name: string;
  balance: number;
  currency: string;
  batch_number: string;
}

interface CloudBill extends RowDataPacket {
  cloud_provider: string;
  account_name: string;
  project_name: string;
  service_type: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  batch_number: string;
}

interface HuaweiResource extends RowDataPacket {
  account_name: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  project_name: string;
  region: string;
  expire_time: Date;
  remaining_days: number;
  batch_number: string;
}

interface TencentResource extends RowDataPacket {
  account_name: string;
  instance_name?: string;
  instance_id?: string;
  disk_name?: string;
  disk_id?: string;
  project_name: string;
  zone: string;
  expired_time: Date;
  differ_days: number;
  batch_number: string;
}

interface HuaweiAccount extends RowDataPacket {
  account_name: string;
  total_amount: number;
  currency: string;
  batch_number: string;
}

interface TencentAccount extends RowDataPacket {
  account_name: string;
  balance: number;
  batch_number: string;
}

interface HuaweiBill extends RowDataPacket {
  account_name: string;
  project_name: string;
  service_type: string;
  amount: number;
  currency: string;
  created_at: Date;
  batch_number: string;
}

interface TencentBill extends RowDataPacket {
  account_name: string;
  project_name: string;
  service_name: string;
  real_total_cost: number;
  billing_date: Date;
  batch_number: string;
}

interface HuaweiStoredCard extends RowDataPacket {
  id: number;
  account_name: string;
  card_id: string;
  card_name: string;
  face_value: number;
  balance: number;
  effective_time: Date;
  expire_time: Date;
  batch_number: string;
  created_at: Date;
  updated_at: Date;
}

// 添加查询参数接口
interface ExpiryResourcesQuery {
  remainingDays?: number;  // 剩余天数阈值
  orderBy?: 'asc' | 'desc';  // 排序方向
}

export class CloudService {
  private validationService: ValidationService;

  constructor() {
    this.validationService = new ValidationService();
  }

  // 生成批次号
  private generateBatchNumber(): string {
    return new Date().toISOString().replace(/[-:\.]/g, '').slice(0, 14);
  }

  // 同步资源数据到统一数据库
  async syncExpiryResources() {
    try {
      const batchNumber = this.generateBatchNumber();
      const resources = await this.getExpiryResources();
      
      // 清除旧数据
      await unifiedPool.query('DELETE FROM cloud_resources');
      
      // 插入新数据
      if (resources && resources.length > 0) {
        const values = resources.map((resource: RowDataPacket) => [
          resource.cloud_provider,
          resource.account_name,
          resource.resource_type,
          resource.resource_id,
          resource.resource_name,
          resource.project_name || 'default',
          resource.region,
          resource.zone || resource.region,
          resource.expire_time,
          resource.remaining_days,
          resource.batch_number
        ]);

        await unifiedPool.query(`
          INSERT INTO cloud_resources 
          (cloud_provider, account_name, resource_type, resource_id, resource_name, 
           project_name, region, zone, expire_time, remaining_days, batch_number)
          VALUES ?
        `, [values]);
      }
    } catch (error) {
      console.error('Error syncing expiry resources:', error);
      throw error;
    }
  }

  // 同步账户余额到统一数据库
  async syncAccountBalances() {
    try {
      const batchNumber = this.generateBatchNumber();
      
      // 获取华为云账户余额
      const [huaweiBalances] = await huaweiPool.query<HuaweiAccount[]>(`
        SELECT account_name, total_amount as balance, 'CNY' as currency, ? as batch_number
        FROM account_balances
      `, [batchNumber]);

      // 获取华为云储值卡信息
      const [huaweiStoredCards] = await huaweiPool.query<HuaweiStoredCard[]>(`
        SELECT 
          account_name,
          card_id,
          card_name,
          face_value,
          balance,
          effective_time,
          expire_time,
          ? as batch_number
        FROM stored_cards
        WHERE status = 'VALID'  -- 只同步有效的储值卡
      `, [batchNumber]);

      // 获取腾讯云账户余额
      const [tencentBalances] = await tencentPool.query<TencentAccount[]>(`
        SELECT account_name, balance, ? as batch_number
        FROM account_balances
      `, [batchNumber]);

      // 清除旧数据
      await unifiedPool.query('DELETE FROM cloud_accounts');
      
      // 准备插入数据
      const values = [
        // 华为云现金余额
        ...huaweiBalances.map(balance => [
          'huawei',
          balance.account_name,
          balance.balance,
          'CNY',
          'cash',
          null,  // expire_time
          balance.batch_number,
          new Date(),  // created_at
          new Date()   // updated_at
        ]),
        // 华为云储值卡
        ...huaweiStoredCards.map(card => [
          'huawei',
          card.account_name,
          card.balance,
          'CNY',
          'stored_card',
          card.expire_time,
          card.batch_number,
          card.effective_time || new Date(),  // created_at 使用生效时间
          new Date()   // updated_at
        ]),
        // 腾讯云余额
        ...tencentBalances.map(balance => [
          'tencent',
          balance.account_name,
          balance.balance,
          'CNY',
          'cash',
          null,  // expire_time
          balance.batch_number,
          new Date(),  // created_at
          new Date()   // updated_at
        ])
      ];

      if (values.length > 0) {
        await unifiedPool.query(`
          INSERT INTO cloud_accounts 
          (cloud_provider, account_name, balance, currency, balance_type, expire_time, batch_number, created_at, updated_at)
          VALUES ?
        `, [values]);
      }
    } catch (error) {
      console.error('Error syncing account balances:', error);
      throw error;
    }
  }

  // 同步账单信息到统一数据库
  async syncBillingDetails() {
    try {
      const bills = await this.getBillingDetails();
      
      // 清除旧数据
      await unifiedPool.query('DELETE FROM cloud_bills');
      
      // 插入新数据
      if (bills && bills.length > 0) {
        const values = bills.map((bill: CloudBill) => [
          bill.cloud_provider,
          bill.account_name,
          bill.project_name,
          bill.service_type,
          bill.amount,
          bill.currency,
          bill.billing_cycle || 'monthly',
          bill.batch_number
        ]);

        await unifiedPool.query(`
          INSERT INTO cloud_bills 
          (cloud_provider, account_name, project_name, service_type, 
           amount, currency, billing_cycle, batch_number)
          VALUES ?
        `, [values]);
      }
    } catch (error) {
      console.error('Error syncing billing details:', error);
      throw error;
    }
  }

  // 修改获取资源到期信息的方法，加入备注信息
  async getExpiryResources(query: ExpiryResourcesQuery = {}) {
    try {
      const { remainingDays = 65, orderBy = 'asc' } = query;
      
      const [resources] = await unifiedPool.query<RowDataPacket[]>(`
        SELECT r.*, rr.remark 
        FROM cloud_resources r
        LEFT JOIN resource_remarks rr 
          ON r.cloud_provider = rr.cloud_provider 
          AND r.resource_id = rr.resource_id
        WHERE r.remaining_days <= ?
        ORDER BY r.remaining_days ${orderBy === 'asc' ? 'ASC' : 'DESC'}
      `, [remainingDays]);

      return resources;
    } catch (error) {
      console.error('Error fetching expiry resources:', error);
      throw error;
    }
  }

  async getAccountBalances(): Promise<CloudAccount[]> {
    try {
      const [balances] = await unifiedPool.query<CloudAccount[]>(`
        SELECT * FROM cloud_accounts
      `);
      return balances;
    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  }

  async getBillingDetails(): Promise<CloudBill[]> {
    try {
      const [bills] = await unifiedPool.query<CloudBill[]>(`
        SELECT * FROM cloud_bills
      `);
      return bills;
    } catch (error) {
      console.error('Error fetching billing details:', error);
      throw error;
    }
  }

  /**
   * 更新资源备注
   * @param resourceId 资源ID
   * @param remark 备注内容
   */
  async updateResourceRemark(resourceId: number, remark: string): Promise<void> {
    try {
      // 首先获取资源信息
      const [resources] = await unifiedPool.query<RowDataPacket[]>(
        'SELECT cloud_provider, resource_id FROM cloud_resources WHERE id = ?',
        [resourceId]
      );

      if (!resources || resources.length === 0) {
        throw new Error('Resource not found');
      }

      const resource = resources[0];

      // 使用 INSERT ... ON DUPLICATE KEY UPDATE 语法
      await unifiedPool.execute(
        `INSERT INTO resource_remarks (cloud_provider, resource_id, remark)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE remark = ?`,
        [resource.cloud_provider, resource.resource_id, remark, remark]
      );
    } catch (error) {
      console.error('Error updating resource remark:', error);
      throw new Error('Failed to update resource remark');
    }
  }
} 