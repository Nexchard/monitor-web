import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 数据库连接配置
interface DBConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  dialect: 'mysql'
}

// 数据库连接管理器
class DatabaseManager {
  private connections: Map<string, Sequelize> = new Map()

  // 初始化数据库连接
  async initializeConnections() {
    try {
      // 腾讯云数据库
      const tencentConfig: DBConfig = {
        host: process.env.TENCENT_DB_HOST || 'localhost',
        port: Number(process.env.TENCENT_DB_PORT) || 3306,
        username: process.env.TENCENT_DB_USER || 'root',
        password: process.env.TENCENT_DB_PASSWORD || '',
        database: process.env.TENCENT_DB_NAME || 'tencent_cloud_db',
        dialect: 'mysql'
      }
      
      const tencentDB = new Sequelize(tencentConfig)
      this.connections.set('primary', tencentDB)

      // 华为云数据库
      const huaweiConfig: DBConfig = {
        host: process.env.HUAWEI_DB_HOST || 'localhost',
        port: Number(process.env.HUAWEI_DB_PORT) || 3306,
        username: process.env.HUAWEI_DB_USER || 'root',
        password: process.env.HUAWEI_DB_PASSWORD || '',
        database: process.env.HUAWEI_DB_NAME || 'huaweicloud_monitor',
        dialect: 'mysql'
      }
      
      const huaweiDB = new Sequelize(huaweiConfig)
      this.connections.set('huawei', huaweiDB)

      // 测试所有连接
      for (const [name, connection] of this.connections) {
        try {
          await connection.authenticate()
          console.log(`Database connection '${name}' has been established successfully.`)
        } catch (error) {
          console.error(`Unable to connect to database '${name}':`, error)
        }
      }
    } catch (error) {
      console.error('Error initializing database connections:', error)
      throw error
    }
  }

  // 获取数据库连接
  getConnection(name: string): Sequelize {
    const connection = this.connections.get(name)
    if (!connection) {
      throw new Error(`Database connection '${name}' not found`)
    }
    return connection
  }

  // 关闭所有连接
  async closeAll() {
    for (const [name, connection] of this.connections) {
      try {
        await connection.close()
        console.log(`Database connection '${name}' closed successfully.`)
      } catch (error) {
        console.error(`Error closing database connection '${name}':`, error)
      }
    }
  }
}

export const dbManager = new DatabaseManager() 

// 添加连接状态日志
dbManager.initializeConnections()
  .then(() => {
    console.log('All database connections initialized successfully')
  })
  .catch(error => {
    console.error('Failed to initialize database connections:', error)
  }) 