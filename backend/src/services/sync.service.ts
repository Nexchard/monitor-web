import { huaweiPool, tencentPool, unifiedPool } from '../config/db.config';
import { ValidationService } from './validation.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import { sleep } from '../utils/common';

// 定义接口
interface Resource extends RowDataPacket {
  account_name: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  project_name: string;
  region: string;
  zone?: string;
  expire_time: Date;
  remaining_days: number;
  status?: string;      // 资源状态
  batch_number: string;
}

interface Account extends RowDataPacket {
  account_name: string;
  total_amount?: number;  // 华为云现金账户用
  balance?: number;       // 腾讯云和华为云储值卡用
  currency: string;
  card_id?: string;      // 储值卡 ID
  card_name?: string;    // 储值卡名称
  face_value?: number;   // 储值卡面值
  expire_time?: Date;    // 储值卡到期时间
  effective_time?: Date; // 华为云储值卡有效时间
  batch_number: string;  // 添加批次号字段
}

interface Bill extends RowDataPacket {
  account_name: string;
  project_name: string;
  service_type?: string;  // 服务类型
  service_name?: string;  // 服务名称
  amount?: number;        // 账单金额
  total_cost?: number;    // 总费用
  real_total_cost?: number;  // 实际费用
  currency: string;
  created_at?: Date;      // 创建时间
  billing_date?: Date;    // 账单日期
  batch_number: string;  // 添加批次号字段
}

export class SyncService {
  private validationService: ValidationService;
  private retryTimes: number;
  private retryDelay: number;

  constructor() {
    this.validationService = new ValidationService();
    this.retryTimes = Number(process.env.SYNC_RETRY_TIMES) || 3;
    this.retryDelay = Number(process.env.SYNC_RETRY_DELAY) || 5000;
  }

  // 记录同步日志
  private async logSync(syncType: string, batchNumber: string, error?: Error) {
    try {
      const now = new Date();
      await unifiedPool.query(`
        INSERT INTO sync_logs 
        (sync_type, start_time, end_time, status, error_message, batch_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        syncType,
        now,
        now,
        error ? 'failed' : 'success',
        error?.message || null,
        batchNumber
      ]);
    } catch (logError) {
      console.error('Error logging sync:', logError);
    }
  }

  // 生成批次号
  private generateBatchNumber(): string {
    return `SYNC_${Date.now()}`;
  }

  // 同步所有数据
  async syncAll() {
    const batchNumber = this.generateBatchNumber();
    console.log(`Starting sync with batch number: ${batchNumber}`);

    let attempts = 0;
    while (attempts < this.retryTimes) {
      try {
        await Promise.all([
          this.syncResources(batchNumber),
          this.syncAccounts(batchNumber),
          this.syncBills(batchNumber)
        ]);
        console.log(`Sync completed successfully for batch: ${batchNumber}`);
        return;
      } catch (error) {
        attempts++;
        console.error(`Sync attempt ${attempts} failed:`, error);
        
        if (attempts < this.retryTimes) {
          console.log(`Retrying in ${this.retryDelay}ms...`);
          await sleep(this.retryDelay);
        }
      }
    }
    
    throw new Error(`Sync failed after ${this.retryTimes} attempts`);
  }

  // 同步资源数据
  private async syncResources(batchNumber: string) {
    try {
      // 获取华为云资源
      const [hwBaseResources] = await huaweiPool.query<(Resource & RowDataPacket)[]>(`
        SELECT 
          account_name,
          service_type as resource_type,
          resource_id,
          resource_name,
          project_name,
          region,
          expire_time,
          remaining_days,
          batch_number
        FROM resources 
        WHERE batch_number = (SELECT MAX(batch_number) FROM resources)
      `);

      // 获取华为云域名资源
      const [hwDomainResources] = await huaweiPool.query<(Resource & RowDataPacket)[]>(`
        SELECT 
          account_name,
          'DOMAIN' as resource_type,
          resource_id,
          resource_name,
          'default' as project_name,
          'global' as region,
          expire_time,
          remaining_days,
          ? as batch_number
        FROM domains
      `, [batchNumber]);

      // 合并华为云资源
      const hwResources = [...hwBaseResources, ...hwDomainResources];

      // 获取腾讯云资源
      const [tcResources] = await tencentPool.query<(Resource & RowDataPacket)[]>(`
        SELECT 
          account_name,
          'CVM' as resource_type,
          instance_id as resource_id,
          instance_name as resource_name,
          COALESCE(project_name, 'default') as project_name,
          zone,
          expired_time as expire_time,
          differ_days as remaining_days,
          batch_number
        FROM cvm_instances 
        WHERE batch_number = (SELECT MAX(batch_number) FROM cvm_instances)
        UNION ALL
        SELECT 
          account_name,
          'CBS' as resource_type,
          disk_id as resource_id,
          disk_name as resource_name,
          COALESCE(project_name, 'default') as project_name,
          zone,
          expired_time as expire_time,
          differ_days as remaining_days,
          batch_number
        FROM cbs_disks 
        WHERE batch_number = (SELECT MAX(batch_number) FROM cbs_disks)
        UNION ALL
        SELECT 
          account_name,
          'LIGHTHOUSE' as resource_type,
          instance_id as resource_id,
          instance_name as resource_name,
          'default' as project_name,  -- 轻量应用服务器没有项目名称，使用默认值
          zone,
          expired_time as expire_time,
          differ_days as remaining_days,
          batch_number
        FROM lighthouse_instances
        WHERE batch_number = (SELECT MAX(batch_number) FROM lighthouse_instances)
        UNION ALL
        SELECT 
          account_name,
          'SSL' as resource_type,
          certificate_id as resource_id,
          domain as resource_name,    -- 使用域名作为资源名称
          COALESCE(project_name, 'default') as project_name,
          'global' as zone,           -- SSL证书是全局资源
          expired_time as expire_time,
          differ_days as remaining_days,
          batch_number
        FROM ssl_certificates
        WHERE batch_number = (SELECT MAX(batch_number) FROM ssl_certificates)
      `);

      // 开启事务
      const connection = await unifiedPool.getConnection();
      await connection.beginTransaction();

      try {
        // 清除旧数据
        await connection.query('DELETE FROM cloud_resources');

        // 插入华为云资源
        if (Array.isArray(hwResources) && hwResources.length > 0) {
          const hwValues = hwResources.map((resource: Resource) => [
            'huawei',
            resource.account_name,
            resource.resource_type,
            resource.resource_id,
            resource.resource_name,
            resource.project_name,
            resource.region,
            resource.region,
            this.formatDate(resource.expire_time),
            resource.remaining_days,
            'active',
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_resources 
            (cloud_provider, account_name, resource_type, resource_id, resource_name,
             project_name, region, zone, expire_time, remaining_days, status, batch_number)
            VALUES ?
            ON DUPLICATE KEY UPDATE
              account_name = VALUES(account_name),
              resource_type = VALUES(resource_type),
              resource_name = VALUES(resource_name),
              project_name = VALUES(project_name),
              region = VALUES(region),
              zone = VALUES(zone),
              expire_time = VALUES(expire_time),
              remaining_days = VALUES(remaining_days),
              status = VALUES(status),
              batch_number = VALUES(batch_number)
          `, [hwValues]);
        }

        // 插入腾讯云资源
        if (Array.isArray(tcResources) && tcResources.length > 0) {
          const tcValues = tcResources.map((resource: Resource & RowDataPacket) => [
            'tencent',
            resource.account_name,
            resource.resource_type,
            resource.resource_id,
            resource.resource_name,
            resource.project_name,
            resource.zone,
            resource.zone,
            this.formatDate(resource.expire_time),
            resource.remaining_days,
            'active',
            resource.batch_number
          ]);

          await connection.query(`
            INSERT INTO cloud_resources 
            (cloud_provider, account_name, resource_type, resource_id, resource_name,
             project_name, region, zone, expire_time, remaining_days, status, batch_number)
            VALUES ?
            ON DUPLICATE KEY UPDATE
              account_name = VALUES(account_name),
              resource_type = VALUES(resource_type),
              resource_name = VALUES(resource_name),
              project_name = VALUES(project_name),
              region = VALUES(region),
              zone = VALUES(zone),
              expire_time = VALUES(expire_time),
              remaining_days = VALUES(remaining_days),
              status = VALUES(status),
              batch_number = VALUES(batch_number)
          `, [tcValues]);
        }

        await connection.commit();
        await this.logSync('resources', batchNumber);

        // 添加验证步骤
        const validationResults = await this.validationService.validateResources(batchNumber);
        
        // 如果存在验证错误
        if (validationResults.errors.length > 0) {
          // 记录验证错误
          await this.logSync('resources_validation', batchNumber, new Error(
            `Validation failed: ${validationResults.errors.join(', ')}`
          ));

          // 可以选择是否抛出错误
          if (process.env.STRICT_VALIDATION === 'true') {
            throw new Error('Data validation failed');
          }
        }

        // 记录验证结果
        console.log(`Validation results for batch ${batchNumber}:`, {
          totalRecords: validationResults.totalCount,
          invalidRecords: validationResults.invalidRecords.length,
          errors: validationResults.errors
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      await this.logSync('resources', batchNumber, error as Error);
      throw error;
    }
  }

  // 同步账户数据
  private async syncAccounts(batchNumber: string) {
    try {
      // 获取华为云现金账户数据
      const [hwCashAccounts] = await huaweiPool.query<(Account & RowDataPacket)[]>(`
        SELECT 
          account_name,
          total_amount,
          currency
        FROM account_balances 
        WHERE batch_number = (SELECT MAX(batch_number) FROM account_balances)
      `);

      // 获取华为云储值卡数据
      const [hwStoredCards] = await huaweiPool.query<(Account & RowDataPacket)[]>(`
        SELECT 
          account_name,
          card_id,
          card_name,
          face_value,
          balance,
          effective_time,
          expire_time
        FROM stored_cards 
        WHERE batch_number = (SELECT MAX(batch_number) FROM stored_cards)
      `);

      // 获取腾讯云账户数据
      const [tcAccounts] = await tencentPool.query<(Account & RowDataPacket)[]>(`
        SELECT 
          account_name,
          balance,
          batch_number
        FROM billing_info 
        WHERE batch_number = (SELECT MAX(batch_number) FROM billing_info)
        AND project_name = '系统'
        AND service_name = '账户余额'
      `);

      // 开启事务
      const connection = await unifiedPool.getConnection();
      await connection.beginTransaction();

      try {
        // 清除旧数据
        await connection.query('DELETE FROM cloud_accounts');

        // 插入华为云现金账户数据
        if (Array.isArray(hwCashAccounts) && hwCashAccounts.length > 0) {
          const hwCashValues = hwCashAccounts.map((account: Account & RowDataPacket) => [
            'huawei',
            account.account_name,
            account.total_amount,
            account.currency,
            'cash',  // 标记为现金余额
            null,    // 现金余额没有过期时间
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_accounts 
            (cloud_provider, account_name, balance, currency, balance_type, expire_time, batch_number)
            VALUES ?
          `, [hwCashValues]);
        }

        // 插入华为云储值卡数据
        if (Array.isArray(hwStoredCards) && hwStoredCards.length > 0) {
          const hwCardValues = hwStoredCards.map((card: Account & RowDataPacket) => [
            'huawei',
            card.account_name,
            card.balance,
            'CNY',
            'stored_card',
            card.expire_time ? new Date(card.expire_time).toISOString().split('T')[0] : null,
            batchNumber
          ]);

          await connection.query(`
            INSERT INTO cloud_accounts 
            (cloud_provider, account_name, balance, currency, balance_type, expire_time, batch_number)
            VALUES ?
          `, [hwCardValues]);
        }

        // 插入腾讯云账户数据
        if (tcAccounts && tcAccounts.length > 0) {
          const tcValues = tcAccounts.map((account: Account & RowDataPacket) => [
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
        await this.logSync('accounts', batchNumber);

        // 添加验证步骤
        const validationResults = await this.validationService.validateAccounts(batchNumber);
        
        if (validationResults.errors.length > 0) {
          await this.logSync('accounts_validation', batchNumber, new Error(
            `Validation failed: ${validationResults.errors.join(', ')}`
          ));

          if (process.env.STRICT_VALIDATION === 'true') {
            throw new Error('Data validation failed');
          }
        }

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      await this.logSync('accounts', batchNumber, error as Error);
      throw error;
    }
  }

  // 同步账单数据
  private async syncBills(batchNumber: string) {
    try {
      // 获取华为云账单数据
      const [hwBills] = await huaweiPool.query<(Bill & RowDataPacket)[]>(`
        SELECT 
          account_name,
          COALESCE(project_name, 'default') as project_name,
          service_type,
          amount,
          currency,
          created_at as billing_date
        FROM account_bills 
        WHERE batch_number = (SELECT MAX(batch_number) FROM account_bills)
      `);

      // 获取腾讯云账单数据 - 排除账户余额记录
      const [tcBills] = await tencentPool.query<(Bill & RowDataPacket)[]>(`
        SELECT 
          account_name,
          COALESCE(project_name, 'default') as project_name,
          service_name as service_type,
          real_total_cost as amount,
          billing_date
        FROM billing_info 
        WHERE batch_number = (SELECT MAX(batch_number) FROM billing_info)
        AND NOT (project_name = '系统' AND service_name = '账户余额')
      `);

      // 开启事务
      const connection = await unifiedPool.getConnection();
      await connection.beginTransaction();

      try {
        // 清除旧数据
        await connection.query('DELETE FROM cloud_bills');

        // 插入华为云账单数据
        if (Array.isArray(hwBills) && hwBills.length > 0) {
          const hwValues = hwBills.map((bill: Bill & RowDataPacket) => [
            'huawei',
            bill.account_name,
            bill.project_name,
            bill.service_type,
            bill.amount,
            bill.currency || 'CNY',
            'monthly',
            this.formatDate(bill.billing_date),
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
        if (Array.isArray(tcBills) && tcBills.length > 0) {
          const tcValues = tcBills.map((bill: Bill & RowDataPacket) => [
            'tencent',
            bill.account_name,
            bill.project_name,
            bill.service_type,
            parseFloat(bill.amount?.toString() || '0').toFixed(2),
            'CNY',
            'monthly',
            this.formatDate(bill.billing_date),
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
        await this.logSync('bills', batchNumber);

        // 添加验证步骤
        const validationResults = await this.validationService.validateBills(batchNumber);
        
        if (validationResults.errors.length > 0) {
          await this.logSync('bills_validation', batchNumber, new Error(
            `Validation failed: ${validationResults.errors.join(', ')}`
          ));

          if (process.env.STRICT_VALIDATION === 'true') {
            throw new Error('Data validation failed');
          }
        }

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      await this.logSync('bills', batchNumber, error as Error);
      throw error;
    }
  }

  // 添加日期处理辅助方法
  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
  }
} 