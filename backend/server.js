require('dotenv').config()
const express = require('express')
const cors = require('cors')
const routes = require('./src/routes')

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())

// 路由
app.use('/api', routes)

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

// 启动服务器
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`)
}) 