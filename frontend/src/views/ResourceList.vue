<template>
    <div class="container">
      <!-- 添加全局加载状态 -->
      <el-loading 
        v-if="loading" 
        :fullscreen="true" 
        text="加载中..."
      />
      
      <!-- 添加错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        show-icon
        class="mb-4"
      />
      
      <!-- 添加空状态提示 -->
      <el-empty
        v-if="!loading && resources.length === 0"
        description="暂无数据"
      />
      
      <!-- 添加页面标题 -->
      <div class="page-header">
        <div class="title-wrapper">
          <h1 class="page-title">
            <el-icon class="title-icon"><Monitor /></el-icon>
            云资源监控看板
          </h1>
          <div class="page-subtitle">云资源到期提醒与费用账单实时监控</div>
        </div>
      </div>
  
      <el-card class="filter-card">
        <el-form :inline="true" @submit.prevent="handleWarningDaysSubmit" class="filter-form">
          <el-form-item label="到期提醒时间">
            <el-input-number 
              v-model="warningDays" 
              :min="1" 
              :max="1000"
              @keyup.enter="handleWarningDaysSubmit"
              placeholder="请输入天数"
              :controls-position="'right'"
              class="warning-days-input"
            />
            <span class="unit-text">天</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleWarningDaysSubmit">
              <el-icon><Check /></el-icon>确认
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 资源列表 -->
      <el-card class="resource-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Timer /></el-icon>
              <span class="title">资源到期情况</span>
            </div>
            <div class="header-right">
              <!-- 筛选条件组 -->
              <div class="filter-group">
                <!-- 平台筛选 -->
                <el-select v-model="selectedPlatform" class="filter-item" clearable placeholder="全部平台">
                  <el-option
                    v-for="platform in platforms"
                    :key="platform.value"
                    :label="platform.label"
                    :value="platform.value"
                  />
                </el-select>
                
                <!-- 账号筛选 -->
                <el-select v-model="selectedAccount" class="filter-item" clearable placeholder="全部账号">
                  <el-option
                    v-for="account in uniqueAccounts"
                    :key="account"
                    :label="account"
                    :value="account"
                  />
                </el-select>
                
                <!-- 资源类型筛选 -->
                <el-select v-model="selectedResourceType" class="filter-item" clearable placeholder="全部资源类型">
                  <el-option
                    v-for="type in uniqueResourceTypes"
                    :key="type"
                    :label="type"
                    :value="type"
                  />
                </el-select>

                <!-- 资源名称搜索 -->
                <el-input
                  v-model="resourceNameKeyword"
                  class="filter-item"
                  placeholder="搜索资源名称"
                  clearable
                  :prefix-icon="Search"
                />
              </div>

              <el-button type="primary" size="small" @click="fetchData">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </div>
        </template>
        <el-table 
          :data="filteredResources" 
          stripe
          v-loading="loading"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
          <el-table-column prop="platform" label="云平台" width="120">
            <template #default="scope">
              <el-tag :type="getPlatformTagType(scope.row.platform)" size="small">
                <PlatformIcon :platform="scope.row.platform" />
                {{ getPlatformLabel(scope.row.platform) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="account_name" label="账号" />
          <el-table-column prop="resource_type" label="资源类型" />
          <el-table-column prop="resource_name" label="资源名称" />
          <el-table-column prop="expired_time" label="到期时间">
            <template #default="scope">
              {{ formatDate(scope.row.expired_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="differ_days" label="剩余天数">
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.differ_days)">
                {{ getTagText(scope.row.differ_days) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- 账户余额信息卡片 -->
      <el-card class="balance-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Money /></el-icon>
              <span class="title">账户余额</span>
            </div>
            <div class="header-right">
              <el-select v-model="selectedBillingPlatform" class="platform-select" clearable placeholder="全部平台">
                <el-option
                  v-for="platform in platforms"
                  :key="platform.value"
                  :label="platform.label"
                  :value="platform.value"
                />
              </el-select>
              <el-button type="primary" size="small" @click="fetchData">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </div>
        </template>
        <el-table 
          :data="systemBalances" 
          stripe
          v-loading="loading"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column prop="platform" label="云平台" width="120">
            <template #default="scope">
              <el-tag :type="getPlatformTagType(scope.row.platform)" size="small">
                <PlatformIcon :platform="scope.row.platform" />
                {{ getPlatformLabel(scope.row.platform) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="account_name" label="账号" min-width="120" />
          <el-table-column prop="balance" label="账户余额" min-width="120">
            <template #default="scope">
              <el-tag :type="getBalanceTagType(scope.row.balance)">
                {{ currencySymbol }}{{ formatMoney(scope.row.balance) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- 账单详情卡片 -->
      <el-card class="billing-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Wallet /></el-icon>
              <span class="title">账单详情</span>
            </div>
            <div class="header-right">
              <el-select v-model="selectedBillingPlatform" class="platform-select" clearable placeholder="全部平台">
                <el-option
                  v-for="platform in platforms"
                  :key="platform.value"
                  :label="platform.label"
                  :value="platform.value"
                />
              </el-select>
              <el-button type="primary" size="small" @click="fetchData">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </div>
        </template>
        <el-table 
          :data="filteredBillings" 
          stripe
          v-loading="loading"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column prop="platform" label="云平台" width="120">
            <template #default="scope">
              <el-tag :type="getPlatformTagType(scope.row.platform)" size="small">
                <PlatformIcon :platform="scope.row.platform" />
                {{ getPlatformLabel(scope.row.platform) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="account_name" label="账号" min-width="120" />
          <el-table-column prop="project_name" label="项目名称" min-width="120" />
          <el-table-column prop="service_name" label="服务类型" min-width="120" />
          <el-table-column prop="real_total_cost" label="费用" min-width="100">
            <template #default="scope">
              {{ currencySymbol }}{{ formatMoney(scope.row.real_total_cost) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed, onUnmounted } from 'vue'
  import { Monitor, Check, Refresh, Timer, Money, Wallet, Search } from '@element-plus/icons-vue'
  import { CloudPlatform, ResourceInfo, BillingInfo } from '../types'
  import { getResources, getBillingInfo } from '../api'
  import dayjs from 'dayjs'
  import PlatformIcon from '../components/PlatformIcon.vue'
  import { ElMessage } from 'element-plus'
  
  // 从 localStorage 获取预警天数，如果没有则使用默认值
  const defaultWarningDays = 30
  const warningDays = ref(Number(localStorage.getItem('warningDays')) || defaultWarningDays)
  
  // 数据加载状态
  const loading = ref(false)
  
  // 资源数据
  const resources = ref<ResourceInfo[]>([])
  const billings = ref<BillingInfo[]>([])
  
  // 平台选择
  const selectedPlatform = ref<CloudPlatform | ''>('')
  const selectedBillingPlatform = ref<CloudPlatform | ''>('')
  
  // 货币符号
  const currencySymbol = '￥'
  
  // 平台配置接口
  interface PlatformConfig {
    label: string
    value: CloudPlatform
    icon: string
  }
  
  // 平台配置 - 只保留腾讯云和华为云
  const platforms: PlatformConfig[] = [
    { 
      label: '腾讯云', 
      value: CloudPlatform.TENCENT,
      icon: 'tencent'
    },
    { 
      label: '华为云', 
      value: CloudPlatform.HUAWEI,
      icon: 'huawei'
    }
  ]
  
  // 筛选条件
  const selectedAccount = ref('')
  const selectedResourceType = ref('')
  const resourceNameKeyword = ref('')
  
  // 获取唯一的账号列表
  const uniqueAccounts = computed(() => {
    const accounts = new Set<string>()
    resources.value.forEach(resource => accounts.add(resource.account_name))
    return Array.from(accounts).sort()
  })
  
  // 获取唯一的资源类型列表
  const uniqueResourceTypes = computed(() => {
    const types = new Set<string>()
    resources.value.forEach(resource => types.add(resource.resource_type))
    return Array.from(types).sort()
  })
  
  // 更新筛选逻辑
  const filteredResources = computed(() => {
    let result = resources.value

    // 平台筛选
    if (selectedPlatform.value) {
      result = result.filter(item => item.platform === selectedPlatform.value)
    }

    // 账号筛选
    if (selectedAccount.value) {
      result = result.filter(item => item.account_name === selectedAccount.value)
    }

    // 资源类型筛选
    if (selectedResourceType.value) {
      result = result.filter(item => item.resource_type === selectedResourceType.value)
    }

    // 资源名称搜索
    if (resourceNameKeyword.value) {
      const keyword = resourceNameKeyword.value.toLowerCase()
      result = result.filter(item => 
        item.resource_name.toLowerCase().includes(keyword)
      )
    }

    return result
  })
  
  // 筛选后的账单列表
  const filteredBillings = computed(() => {
    console.log('Filtering billings:', billings.value, 'Selected platform:', selectedBillingPlatform.value)
    if (!selectedBillingPlatform.value) return billings.value
    return billings.value.filter(item => item.platform === selectedBillingPlatform.value)
  })
  
  // 系统余额信息
  const systemBalances = computed(() => {
    const balances = new Map<string, BillingInfo>()
    billings.value.forEach(billing => {
      const key = `${billing.platform}-${billing.account_name}`
      if (!balances.has(key) && billing.balance !== undefined) {
        balances.set(key, billing)
      }
    })
    return Array.from(balances.values())
  })
  
  // 添加错误状态
  const error = ref<string>('')
  
  // 获取数据
  const fetchData = async () => {
    try {
      loading.value = true
      error.value = ''
      
      const [resourcesRes, billingsRes] = await Promise.all([
        getResources({ warningDays: warningDays.value }),
        getBillingInfo()
      ])

      // 打印原始响应数据
      console.log('Resources raw response:', resourcesRes)
      console.log('Billings raw response:', billingsRes)

      // 确保数据存在并且格式正确
      if (resourcesRes?.data?.data) {
        resources.value = resourcesRes.data.data
        console.log('Processed resources:', resources.value)
      } else {
        console.warn('No resources data in response')
        resources.value = []
      }

      if (billingsRes?.data?.data) {
        billings.value = billingsRes.data.data
        console.log('Processed billings:', billings.value)
      } else {
        console.warn('No billings data in response')
        billings.value = []
      }

      // 如果数据为空，显示提示
      if (resources.value.length === 0) {
        ElMessage.warning('没有找到资源数据')
      }
      if (billings.value.length === 0) {
        ElMessage.warning('没有找到账单数据')
      }

    } catch (err) {
      console.error('获取数据失败:', err)
      error.value = '获取数据失败，请检查网络连接'
      ElMessage.error(error.value)
      resources.value = []
      billings.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 格式化日期
  const formatDate = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD')
  }
  
  // 格式化金额
  const formatMoney = (value: number) => {
    return value.toFixed(2)
  }
  
  // 获取标签文本
  const getTagText = (days: number): string => {
    // 直接返回天数，不添加括号说明
    return `${days}天`
  }
  
  // 获取标签类型
  const getTagType = (days: number): string => {
    if (days <= 15) {
      return 'danger'    // 红色：剩余 ≤ 15天
    } else if (days <= 30) {
      return 'warning'   // 黄色：剩余 16-30天
    } else if (days <= 65) {
      return 'primary'   // 蓝色：剩余 31-65天
    } else {
      return 'success'   // 绿色：剩余 > 65天
    }
  }
  
  // 获取余额标签类型
  const getBalanceTagType = (balance: number | undefined): string => {
    if (balance === undefined) return 'info'
    if (balance <= 100) return 'danger'
    if (balance <= 500) return 'warning'
    if (balance <= 1000) return 'info'
    return 'success'
  }
  
  // 获取平台标签类型
  const getPlatformTagType = (platform: CloudPlatform): string => {
    switch (platform) {
      case CloudPlatform.TENCENT:
        return 'primary'
      case CloudPlatform.HUAWEI:
        return 'danger'
      default:
        return 'info'
    }
  }
  
  // 获取平台显示名称
  const getPlatformLabel = (platform: CloudPlatform): string => {
    const found = platforms.find(p => p.value === platform)
    return found ? found.label : platform
  }
  
  // 处理预警天数提交
  const handleWarningDaysSubmit = () => {
    localStorage.setItem('warningDays', warningDays.value.toString())
    fetchData()
  }
  
  // 重置预警天数
  const handleReset = () => {
    warningDays.value = defaultWarningDays
    localStorage.setItem('warningDays', defaultWarningDays.toString())
    fetchData()
  }
  
  // 轮询相关
  let pollingTimer: number | null = null
  const pollingInterval = import.meta.env.VITE_APP_POLLING_INTERVAL || 30000
  
  const startPolling = () => {
    if (!pollingTimer) {
      pollingTimer = window.setInterval(fetchData, pollingInterval)
    }
  }
  
  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }
  
  // 处理页面可见性变化
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopPolling()
    } else {
      fetchData()
      startPolling()
    }
  }
  
  // 生命周期钩子
  onMounted(() => {
    fetchData()
    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
  
  onUnmounted(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    background-color: var(--el-bg-color-page);
    min-height: 100vh;
  }
  
  /* 添加页面标题样式 */
  .page-header {
    margin-bottom: 24px;
    padding: 16px 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  .title-wrapper {
    text-align: center;
  }
  
  .page-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 28px;
    color: var(--el-color-primary);
  }
  
  .page-subtitle {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
  
  /* 美化卡片样式 */
  .filter-card,
  .resource-card,
  .balance-card,
  .billing-card {
    margin-bottom: 24px;
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    transition: all 0.3s ease;
  }
  
  .filter-card:hover,
  .resource-card:hover,
  .balance-card:hover,
  .billing-card:hover {
    box-shadow: var(--el-box-shadow);
  }
  
  /* 美化表格样式 */
  :deep(.el-table) {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);
    border-radius: 4px;
  }
  
  :deep(.el-table th) {
    font-weight: 600;
  }
  
  /* 美化标签样式 */
  :deep(.el-tag) {
    border-radius: 4px;
    padding: 4px 12px;
    font-weight: 500;
    font-size: 14px;
  }
  
  .filter-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .warning-days-input {
    width: 160px;
  }
  .unit-text {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-left .title {
    font-size: 16px;
    font-weight: 500;
  }
  .el-icon {
    vertical-align: middle;
  }
  /* 移动端适配 */
  @media screen and (max-width: 768px) {
    .container {
      padding: 12px;
    }
    .page-header {
      margin-bottom: 16px;
      padding: 12px 0;
    }
    .title-wrapper {
      text-align: center;
    }
    .page-title {
      font-size: 20px;
    }
    .title-icon {
      font-size: 24px;
    }
    .page-subtitle {
      font-size: 13px;
    }
    .filter-form {
      flex-direction: column;
      align-items: stretch;
    }
    .warning-days-input {
      width: 100%;
    }
    .el-form-item {
      margin-right: 0;
      margin-bottom: 16px;
    }
    .el-button {
      width: 100%;
      margin-bottom: 8px;
    }
  }
  
  /* 添加新样式 */
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .platform-select {
    width: 120px;
  }
  
  /* 移动端适配补充 */
  @media screen and (max-width: 768px) {
    .header-right {
      flex-direction: column;
      gap: 8px;
    }
    
    .platform-select {
      width: 100%;
    }
  }
  
  /* 添加平台图标样式 */
  .platform-icon {
    margin-right: 4px;
    vertical-align: middle;
  }
  
  :deep(.el-tag) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-weight: 500;
    font-size: 14px;
  }
  
  /* 自定义标签颜色 */
  :deep(.el-tag--danger) {
    background-color: var(--el-color-danger-light-9);
    border-color: var(--el-color-danger-light-5);
    color: var(--el-color-danger);
  }
  
  :deep(.el-tag--warning) {
    background-color: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-5);
    color: var(--el-color-warning);
  }
  
  :deep(.el-tag--primary) {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
  }
  
  :deep(.el-tag--success) {
    background-color: var(--el-color-success-light-9);
    border-color: var(--el-color-success-light-5);
    color: var(--el-color-success);
  }
  
  .filter-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-right: 12px;
  }
  
  .filter-item {
    width: 180px;
  }
  
  /* 移动端适配 */
  @media screen and (max-width: 768px) {
    .header-right {
      flex-direction: column;
      gap: 12px;
    }
    
    .filter-group {
      flex-direction: column;
      width: 100%;
      margin-right: 0;
    }
    
    .filter-item {
      width: 100%;
    }
  }
  </style> 