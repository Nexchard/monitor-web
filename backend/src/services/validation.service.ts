import { unifiedPool } from '../config/db.config';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

interface ValidationRecord extends RowDataPacket {
  id?: number;
  resource_id?: string;
  resource_name?: string;
  account_name?: string;
  balance?: number;
  amount?: number;
  billing_date?: Date;
  expire_time?: Date;
  service_type?: string;
  count?: number;
  total?: number;
}

interface ValidationResult {
  totalCount: number;
  invalidRecords: ValidationRecord[];
  errors: string[];
}

export class ValidationService {
  // 验证资源数据
  async validateResources(batchNumber: string): Promise<ValidationResult> {
    const validationResults: ValidationResult = {
      totalCount: 0,
      invalidRecords: [],
      errors: []
    };

    try {
      // 1. 检查必填字段
      const [invalidRequiredFields] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, resource_id, resource_name, account_name
        FROM cloud_resources
        WHERE batch_number = ?
        AND (resource_id IS NULL OR resource_name IS NULL OR account_name IS NULL)
      `, [batchNumber]);

      if (Array.isArray(invalidRequiredFields) && invalidRequiredFields.length > 0) {
        validationResults.invalidRecords.push(...invalidRequiredFields);
        validationResults.errors.push('Found resources with missing required fields');
      }

      // 2. 检查日期格式
      const [invalidDates] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, resource_id, expire_time
        FROM cloud_resources
        WHERE batch_number = ?
        AND expire_time IS NOT NULL
        AND expire_time NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      `, [batchNumber]);

      if (Array.isArray(invalidDates) && invalidDates.length > 0) {
        validationResults.invalidRecords.push(...invalidDates);
        validationResults.errors.push('Found resources with invalid date format');
      }

      // 3. 检查重复记录
      const [duplicates] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT resource_id, COUNT(*) as count
        FROM cloud_resources
        WHERE batch_number = ?
        GROUP BY cloud_provider, resource_id
        HAVING count > 1
      `, [batchNumber]);

      if (Array.isArray(duplicates) && duplicates.length > 0) {
        validationResults.invalidRecords.push(...duplicates);
        validationResults.errors.push('Found duplicate resource records');
      }

      // 4. 获取总记录数
      const [totalCountResult] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT COUNT(*) as total
        FROM cloud_resources
        WHERE batch_number = ?
      `, [batchNumber]);

      validationResults.totalCount = totalCountResult[0]?.total || 0;

      return validationResults;
    } catch (error) {
      console.error('Error validating resources:', error);
      throw error;
    }
  }

  // 验证账户数据
  async validateAccounts(batchNumber: string): Promise<ValidationResult> {
    const validationResults: ValidationResult = {
      totalCount: 0,
      invalidRecords: [],
      errors: []
    };

    try {
      // 1. 检查必填字段
      const [invalidRequiredFields] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, account_name, balance
        FROM cloud_accounts
        WHERE batch_number = ?
        AND (account_name IS NULL OR balance IS NULL)
      `, [batchNumber]);

      if (Array.isArray(invalidRequiredFields) && invalidRequiredFields.length > 0) {
        validationResults.invalidRecords.push(...invalidRequiredFields);
        validationResults.errors.push('Found accounts with missing required fields');
      }

      // 2. 检查余额格式
      const [invalidBalances] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, account_name, balance
        FROM cloud_accounts
        WHERE batch_number = ?
        AND (balance < 0 OR balance IS NULL)
      `, [batchNumber]);

      if (Array.isArray(invalidBalances) && invalidBalances.length > 0) {
        validationResults.invalidRecords.push(...invalidBalances);
        validationResults.errors.push('Found accounts with invalid balance');
      }

      // 3. 检查账户唯一性
      const [duplicateAccounts] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT account_name, COUNT(*) as count
        FROM cloud_accounts
        WHERE batch_number = ?
        GROUP BY cloud_provider, account_name, balance_type
        HAVING count > 1
      `, [batchNumber]);

      if (Array.isArray(duplicateAccounts) && duplicateAccounts.length > 0) {
        validationResults.invalidRecords.push(...duplicateAccounts);
        validationResults.errors.push('Found duplicate account records');
      }

      // 4. 获取总记录数
      const [totalCountResult] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT COUNT(*) as total
        FROM cloud_accounts
        WHERE batch_number = ?
      `, [batchNumber]);

      validationResults.totalCount = totalCountResult[0]?.total || 0;

      return validationResults;
    } catch (error) {
      console.error('Error validating accounts:', error);
      throw error;
    }
  }

  // 验证账单数据
  async validateBills(batchNumber: string): Promise<ValidationResult> {
    const validationResults: ValidationResult = {
      totalCount: 0,
      invalidRecords: [],
      errors: []
    };

    try {
      // 1. 检查必填字段
      const [invalidRequiredFields] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, account_name, amount, service_type
        FROM cloud_bills
        WHERE batch_number = ?
        AND (account_name IS NULL OR amount IS NULL OR service_type IS NULL)
      `, [batchNumber]);

      if (Array.isArray(invalidRequiredFields) && invalidRequiredFields.length > 0) {
        validationResults.invalidRecords.push(...invalidRequiredFields);
        validationResults.errors.push('Found bills with missing required fields');
      }

      // 2. 检查金额格式
      const [invalidAmounts] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, account_name, amount
        FROM cloud_bills
        WHERE batch_number = ?
        AND (amount < 0 OR amount IS NULL)
      `, [batchNumber]);

      if (Array.isArray(invalidAmounts) && invalidAmounts.length > 0) {
        validationResults.invalidRecords.push(...invalidAmounts);
        validationResults.errors.push('Found bills with invalid amount');
      }

      // 3. 检查账单日期
      const [invalidDates] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT id, account_name, billing_date
        FROM cloud_bills
        WHERE batch_number = ?
        AND (
          billing_date IS NULL 
          OR billing_date > CURRENT_DATE
          OR billing_date NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
        )
      `, [batchNumber]);

      if (Array.isArray(invalidDates) && invalidDates.length > 0) {
        validationResults.invalidRecords.push(...invalidDates);
        validationResults.errors.push('Found bills with invalid dates');
      }

      // 4. 获取总记录数
      const [totalCountResult] = await unifiedPool.query<ValidationRecord[]>(`
        SELECT COUNT(*) as total
        FROM cloud_bills
        WHERE batch_number = ?
      `, [batchNumber]);

      validationResults.totalCount = totalCountResult[0]?.total || 0;

      return validationResults;
    } catch (error) {
      console.error('Error validating bills:', error);
      throw error;
    }
  }
} 