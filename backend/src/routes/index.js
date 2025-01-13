const express = require('express')
const router = express.Router()
const db = require('../db')

// 获取资源列表
router.get('/resources', async (req, res) => {
  try {
    const warningDays = parseInt(req.query.warningDays) || 30
    
    // 腾讯云资源查询
    const tencentQuery = `
      SELECT * FROM (
        SELECT 
          'CVM' as resource_type,
          account_name,
          instance_name as resource_name,
          expired_time,
          differ_days,
          id
        FROM cvm_instances
        WHERE id = (
          SELECT MAX(id)
          FROM cvm_instances c2
          WHERE c2.instance_id = cvm_instances.instance_id
        )
        UNION ALL
        SELECT 
          'CBS' as resource_type,
          account_name,
          disk_name as resource_name,
          expired_time,
          differ_days,
          id
        FROM cbs_disks
        WHERE id = (
          SELECT MAX(id)
          FROM cbs_disks c2
          WHERE c2.disk_id = cbs_disks.disk_id
        )
        UNION ALL
        SELECT 
          'Domain' as resource_type,
          account_name,
          domain_name as resource_name,
          expired_time,
          differ_days,
          id
        FROM domains
        WHERE id = (
          SELECT MAX(id)
          FROM domains d2
          WHERE d2.domain_id = domains.domain_id
        )
        UNION ALL
        SELECT 
          'Lighthouse' as resource_type,
          account_name,
          instance_name as resource_name,
          expired_time,
          differ_days,
          id
        FROM lighthouse_instances
        WHERE id = (
          SELECT MAX(id)
          FROM lighthouse_instances l2
          WHERE l2.instance_id = lighthouse_instances.instance_id
        )
        UNION ALL
        SELECT 
          'SSL' as resource_type,
          account_name,
          domain as resource_name,
          expired_time,
          differ_days,
          id
        FROM ssl_certificates
        WHERE id = (
          SELECT MAX(id)
          FROM ssl_certificates s2
          WHERE s2.certificate_id = ssl_certificates.certificate_id
        )
      ) AS combined
      WHERE differ_days <= ?
      ORDER BY differ_days ASC;
    `
    
    // 华为云资源查询
    const huaweiQuery = `
      SELECT 
        id,
        account_name,
        service_type as resource_type,
        resource_name,
        expire_time as expired_time,
        DATEDIFF(expire_time, NOW()) as differ_days,
        resource_id,
        region
      FROM resources
      WHERE id IN (
        SELECT MAX(id)
        FROM resources
        GROUP BY resource_id
      )
      AND DATEDIFF(expire_time, NOW()) <= ?
      ORDER BY differ_days ASC;
    `

    // 并行查询两个数据库
    const [tencentResources, huaweiResources] = await Promise.all([
      db.query(tencentQuery, [warningDays], db.tencentPool),
      db.query(huaweiQuery, [warningDays], db.huaweiPool)
    ])

    // 合并结果并添加平台标识
    const combinedResources = [
      ...tencentResources.map(r => ({ ...r, platform: 'tencent' })),
      ...huaweiResources.map(r => ({ ...r, platform: 'huawei' }))
    ]

    // 按剩余天数排序
    combinedResources.sort((a, b) => a.differ_days - b.differ_days)

    res.json({ data: combinedResources })
  } catch (error) {
    console.error('Error fetching data:', {
      message: error.message,
      code: error.code,
    })
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 获取账单信息
router.get('/billing', async (req, res) => {
  try {
    console.log('开始获取账单信息...')
    
    // 查询腾讯云账户余额
    const tencentBalanceQuery = `
      SELECT 
        id,
        account_name,
        project_name,
        service_name,
        balance,
        real_total_cost,
        total_cost,
        cash_pay_amount,
        updated_at
      FROM billing_info
      WHERE id IN (
        SELECT MAX(id)
        FROM billing_info
        WHERE service_name = '账户余额'
        GROUP BY account_name
      );
    `

    // 查询华为云账户余额
    const huaweiBalanceQuery = `
      SELECT 
        id,
        account_name,
        total_amount as balance,
        currency,
        updated_at
      FROM account_balances
      WHERE id IN (
        SELECT MAX(id)
        FROM account_balances
        GROUP BY account_name
      );
    `

    // 查询腾讯云其他账单信息
    const tencentBillingQuery = `
      SELECT 
        id,
        account_name,
        project_name,
        service_name,
        balance,
        real_total_cost,
        total_cost,
        cash_pay_amount,
        updated_at
      FROM billing_info
      WHERE id IN (
        SELECT MAX(id)
        FROM billing_info
        WHERE service_name != '账户余额'
        GROUP BY account_name, project_name, service_name
      )
      AND project_name != '系统'
      ORDER BY account_name, project_name;
    `

    // 并行查询所有数据
    const [tencentBalances, huaweiBalances, tencentBillings] = await Promise.all([
      db.query(tencentBalanceQuery, [], db.tencentPool),
      db.query(huaweiBalanceQuery, [], db.huaweiPool),
      db.query(tencentBillingQuery, [], db.tencentPool)
    ])

    // 格式化腾讯云余额数据
    const formattedTencentBalances = tencentBalances.map(balance => ({
      ...balance,
      platform: 'tencent',
      balance: parseFloat(balance.balance) || 0,
      real_total_cost: parseFloat(balance.real_total_cost) || 0,
      total_cost: parseFloat(balance.total_cost) || 0,
      cash_pay_amount: parseFloat(balance.cash_pay_amount) || 0
    }))

    // 格式化华为云余额数据
    const formattedHuaweiBalances = huaweiBalances.map(balance => ({
      id: balance.id,
      account_name: balance.account_name,
      platform: 'huawei',
      balance: parseFloat(balance.balance) || 0,
      service_name: '账户余额',
      updated_at: balance.updated_at
    }))

    // 格式化腾讯云账单数据
    const formattedTencentBillings = tencentBillings.map(billing => ({
      ...billing,
      platform: 'tencent',
      balance: parseFloat(billing.balance) || 0,
      real_total_cost: parseFloat(billing.real_total_cost) || 0,
      total_cost: parseFloat(billing.total_cost) || 0,
      cash_pay_amount: parseFloat(billing.cash_pay_amount) || 0
    }))

    // 合并所有数据
    const formattedBillings = [
      ...formattedTencentBalances,
      ...formattedHuaweiBalances,
      ...formattedTencentBillings
    ]

    res.json({ data: formattedBillings })
  } catch (error) {
    console.error('Error fetching data:', {
      message: error.message,
      code: error.code,
    })
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router