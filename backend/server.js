require('dotenv').config()
const express = require('express')
const cors = require('cors')
const routes = require('./src/routes')
const os = require('os')

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

// 中间件
app.use(cors({
  origin: '*',
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

// 获取本机的 IP 地址
const getLocalExternalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// 启动服务器
app.listen(port, host, () => {
  const localIP = getLocalExternalIP()
  console.log(`Server running at http://${localIP}:${port}/`)
}) 