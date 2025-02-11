import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  try {
    // 创建数据库连接
    const connection = await createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true // 允许执行多条SQL语句
    });

    // 先创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci;`);

    // 使用数据库
    await connection.query(`USE ${process.env.DB_DATABASE}`);

    // 读取SQL文件
    const sqlFile = readFileSync(join(__dirname, 'init.sql'), 'utf8');

    // 执行SQL语句
    await connection.query(sqlFile);

    console.log('Database initialized successfully');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase(); 