import { huaweiPool, tencentPool, unifiedPool } from '../config/db.config';
import { ValidationService } from './validation.service';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

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

  // 同步资源数据到统一数据库
  async syncExpiryResources() {
    try {
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
      const balances = await this.getAccountBalances();
      
      // 清除旧数据
      await unifiedPool.query('DELETE FROM cloud_accounts');
      
      // 插入新数据
      if (balances && balances.length > 0) {
        const values = balances.map((balance: CloudAccount) => [
          balance.cloud_provider,
          balance.account_name,
          balance.balance,
          balance.currency,
          balance.batch_number
        ]);

        await unifiedPool.query(`
          INSERT INTO cloud_accounts 
          (cloud_provider, account_name, balance, currency, batch_number)
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

  // 修改获取资源到期信息的方法
  async getExpiryResources(query: ExpiryResourcesQuery = {}) {
    try {
      const { remainingDays = 65, orderBy = 'asc' } = query;
      
      const [resources] = await unifiedPool.query<RowDataPacket[]>(`
        SELECT * FROM cloud_resources
        WHERE remaining_days <= ?
        ORDER BY remaining_days ${orderBy === 'asc' ? 'ASC' : 'DESC'}
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

  private async syncResources(batchNumber: string) {
    try {
      // 修改查询方式
      const [hwResources] = await huaweiPool.query<HuaweiResource[]>(`
        SELECT * FROM resources 
        WHERE batch_number = (SELECT MAX(batch_number) FROM resources)
      `);

      const [tcResources] = await tencentPool.query<TencentResource[]>(`
        SELECT 
          account_name,
          instance_name,
          instance_id,
          project_name,
          zone,
          expired_time,
          differ_days,
          batch_number
        FROM cvm_instances 
        WHERE batch_number = (SELECT MAX(batch_number) FROM cvm_instances)
        UNION ALL
        SELECT 
          account_name,
          disk_name as instance_name,
          disk_id as instance_id,
          project_name,
          zone,
          expired_time,
          differ_days,
          batch_number
        FROM cbs_disks 
        WHERE batch_number = (SELECT MAX(batch_number) FROM cbs_disks)
      `);

      // 开启事务
      const connection = await unifiedPool.getConnection();
      await connection.beginTransaction();

      try {
        // 清除旧数据
        await connection.query('DELETE FROM cloud_resources');

        // 插入华为云资源
        if (hwResources && hwResources.length > 0) {
          const hwValues = hwResources.map((resource: HuaweiResource) => [
            'huawei',
            resource.account_name,
            resource.resource_type,
            resource.resource_id,
            resource.resource_name,
            resource.project_name,
            resource.region,
            resource.region,
            resource.expire_time,
            resource.remaining_days,
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_resources 
            (cloud_provider, account_name, resource_type, resource_id, resource_name,
             project_name, region, zone, expire_time, remaining_days, batch_number)
            VALUES ?
          `, [hwValues]);
        }

        // 插入腾讯云资源
        if (tcResources && tcResources.length > 0) {
          const tcValues = tcResources.map((resource: TencentResource) => [
            'tencent',
            resource.account_name,
            resource.instance_id ? 'CVM' : 'CBS',
            resource.instance_id || resource.disk_id,
            resource.instance_name || resource.disk_name,
            resource.project_name,
            resource.zone,
            resource.zone,
            resource.expired_time,
            resource.differ_days,
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_resources 
            (cloud_provider, account_name, resource_type, resource_id, resource_name,
             project_name, region, zone, expire_time, remaining_days, batch_number)
            VALUES ?
          `, [tcValues]);
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error syncing resources:', error);
      throw error;
    }
  }

  // 添加账户同步方法
  private async syncAccounts(batchNumber: string) {
    try {
      // 获取华为云账户数据
      const [hwAccounts] = await huaweiPool.query<HuaweiAccount[]>(`
        SELECT * FROM account_balances 
        WHERE batch_number = (SELECT MAX(batch_number) FROM account_balances)
      `);

      // 获取腾讯云账户数据
      const [tcAccounts] = await tencentPool.query<TencentAccount[]>(`
        SELECT * FROM billing_info 
        WHERE batch_number = (SELECT MAX(batch_number) FROM billing_info)
      `);

      // 开启事务
      const connection = await unifiedPool.getConnection();
      await connection.beginTransaction();

      try {
        // 清除旧数据
        await connection.query('DELETE FROM cloud_accounts');

        // 插入华为云账户数据
        if (hwAccounts && hwAccounts.length > 0) {
          const hwValues = hwAccounts.map((account: HuaweiAccount) => [
            'huawei',
            account.account_name,
            account.total_amount,
            account.currency,
            'cash',
            null, // expire_time
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_accounts 
            (cloud_provider, account_name, balance, currency, balance_type, expire_time, batch_number)
            VALUES ?
          `, [hwValues]);
        }

        // 插入腾讯云账户数据
        if (tcAccounts && tcAccounts.length > 0) {
          const tcValues = tcAccounts.map((account: TencentAccount) => [
            'tencent',
            account.account_name,
            account.balance,
            'CNY',
            'cash',
            null, // expire_time
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_accounts 
            (cloud_provider, account_name, balance, currency, balance_type, expire_time, batch_number)
            VALUES ?
          `, [tcValues]);
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error syncing accounts:', error);
      throw error;
    }
  }

  // 添加账单同步方法
  private async syncBills(batchNumber: string) {
    try {
      // 获取华为云账单数据
      const [hwBills] = await huaweiPool.query<HuaweiBill[]>(`
        SELECT * FROM account_bills 
        WHERE batch_number = (SELECT MAX(batch_number) FROM account_bills)
      `);

      // 获取腾讯云账单数据
      const [tcBills] = await tencentPool.query<TencentBill[]>(`
        SELECT * FROM billing_info 
        WHERE batch_number = (SELECT MAX(batch_number) FROM billing_info)
      `);

      // 开启事务
      const connection = await unifiedPool.getConnection();
      await connection.beginTransaction();

      try {
        // 清除旧数据
        await connection.query('DELETE FROM cloud_bills');

        // 插入华为云账单数据
        if (hwBills && hwBills.length > 0) {
          const hwValues = hwBills.map((bill: HuaweiBill) => [
            'huawei',
            bill.account_name,
            bill.project_name,
            bill.service_type,
            bill.amount,
            bill.currency,
            'monthly',
            bill.created_at ? new Date(bill.created_at).toISOString().split('T')[0] : null,
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_bills 
            (cloud_provider, account_name, project_name, service_type, amount, 
             currency, billing_cycle, billing_date, batch_number)
            VALUES ?
          `, [hwValues]);
        }

        // 插入腾讯云账单数据
        if (tcBills && tcBills.length > 0) {
          const tcValues = tcBills.map((bill: TencentBill) => [
            'tencent',
            bill.account_name,
            bill.project_name,
            bill.service_name,
            bill.real_total_cost,
            'CNY',
            'monthly',
            bill.billing_date ? new Date(bill.billing_date).toISOString().split('T')[0] : null,
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_bills 
            (cloud_provider, account_name, project_name, service_type, amount, 
             currency, billing_cycle, billing_date, batch_number)
            VALUES ?
          `, [tcValues]);
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error syncing bills:', error);
      throw error;
    }
  }
} 