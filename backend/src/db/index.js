import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 创建数据库连接池的通用配置
const poolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}

// 创建腾讯云数据库连接池
const tencentPool = mysql.createPool({
  host: process.env.TENCENT_DB_HOST,
  port: Number(process.env.TENCENT_DB_PORT),
  user: process.env.TENCENT_DB_USER,
  password: process.env.TENCENT_DB_PASSWORD,
  database: process.env.TENCENT_DB_NAME,
  ...poolConfig
})

// 创建华为云数据库连接池
const huaweiPool = mysql.createPool({
  host: process.env.HUAWEI_DB_HOST,
  port: Number(process.env.HUAWEI_DB_PORT),
  user: process.env.HUAWEI_DB_USER,
  password: process.env.HUAWEI_DB_PASSWORD,
  database: process.env.HUAWEI_DB_NAME,
  ...poolConfig
})

// 测试数据库连接
const testConnection = async (pool, name) => {
  try {
    const connection = await pool.getConnection()
    console.log(`${name} database connection successful`)
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1')
    console.log(`${name} database test query successful:`, rows)
    
    connection.release()
  } catch (error) {
    console.error(`${name} database connection failed:`, error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      host: error.host,
      port: error.port
    })
    throw error
  }
}

// 导出查询方法
export const query = async (sql, values, pool = tencentPool) => {
  try {
    const [rows] = await pool.execute(sql, values)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// 初始化时测试连接
testConnection(tencentPool, 'Tencent Cloud')
testConnection(huaweiPool, 'Huawei Cloud')

export { tencentPool, huaweiPool } 