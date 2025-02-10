import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createPool = (config: any) => {
  try {
    return mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (error) {
    console.error('Error creating database pool:', error);
    throw error;
  }
};

// 统一数据库连接池
export const unifiedPool = createPool({
  host: process.env.UNIFIED_DB_HOST,
  user: process.env.UNIFIED_DB_USER,
  password: process.env.UNIFIED_DB_PASSWORD,
  port: Number(process.env.UNIFIED_DB_PORT),
  database: process.env.UNIFIED_DB_DATABASE
});

// 华为云监控数据库连接池
export const huaweiPool = createPool({
  host: process.env.HUAWEI_DB_HOST,
  user: process.env.HUAWEI_DB_USER,
  password: process.env.HUAWEI_DB_PASSWORD,
  port: Number(process.env.HUAWEI_DB_PORT),
  database: process.env.HUAWEI_DB_DATABASE
});

// 腾讯云监控数据库连接池
export const tencentPool = createPool({
  host: process.env.TENCENT_DB_HOST,
  user: process.env.TENCENT_DB_USER,
  password: process.env.TENCENT_DB_PASSWORD,
  port: Number(process.env.TENCENT_DB_PORT),
  database: process.env.TENCENT_DB_DATABASE
});

// 测试数据库连接
const testConnections = async () => {
  try {
    await Promise.all([
      huaweiPool.query('SELECT 1'),
      tencentPool.query('SELECT 1'),
      unifiedPool.query('SELECT 1')
    ]);
    console.log('Database connections successful');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

testConnections(); 