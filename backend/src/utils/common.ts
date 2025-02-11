export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 

/**
 * 生成批次号
 * 格式：yyyyMMddHHmmss
 */
export const generateBatchNumber = (): string => {
  return new Date().toISOString().replace(/[-:\.]/g, '').slice(0, 14);
};

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * 计算剩余天数
 * @param expireDate 到期日期
 * @returns 剩余天数
 */
export const calculateRemainingDays = (expireDate: Date | string): number => {
  const expire = new Date(expireDate);
  const now = new Date();
  const diffTime = expire.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 