import express from 'express'
import { dbManager } from './config/database'

const app = express()

// 初始化数据库连接
dbManager.initializeConnections()
  .then(() => {
    console.log('Database connections initialized successfully')
  })
  .catch(error => {
    console.error('Failed to initialize database connections:', error)
  })

// ... 其他代码 