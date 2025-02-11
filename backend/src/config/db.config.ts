import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 统一的数据库连接池配置
export const unifiedPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 华为云数据库连接池配置
export const huaweiPool = mysql.createPool({
  host: process.env.HUAWEI_DB_HOST,
  port: Number(process.env.HUAWEI_DB_PORT),
  user: process.env.HUAWEI_DB_USER,
  password: process.env.HUAWEI_DB_PASSWORD,
  database: process.env.HUAWEI_DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 腾讯云数据库连接池配置
export const tencentPool = mysql.createPool({
  host: process.env.TENCENT_DB_HOST,
  port: Number(process.env.TENCENT_DB_PORT),
  user: process.env.TENCENT_DB_USER,
  password: process.env.TENCENT_DB_PASSWORD,
  database: process.env.TENCENT_DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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