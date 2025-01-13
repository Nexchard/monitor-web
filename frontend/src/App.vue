<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}

/* Element Plus 组件样式覆盖 */
.el-card {
  margin-bottom: 20px !important;
  border-radius: 8px !important;
}

.el-card__header {
  padding: 12px 16px !important;
  border-bottom: 1px solid var(--el-border-color-light) !important;
}

.el-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

.el-table {
  --el-table-header-bg-color: var(--el-bg-color-page) !important;
}

.el-table th {
  font-weight: 600 !important;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .el-card {
    margin-bottom: 16px !important;
    border-radius: 4px !important;
  }

  .el-card__header {
    padding: 8px 12px !important;
  }

  .el-card__body {
    padding: 12px !important;
  }

  .el-form--inline {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .el-form--inline .el-form-item {
    margin-right: 0 !important;
    margin-bottom: 16px !important;
  }

  .el-form--inline .el-form-item:last-child {
    margin-bottom: 0 !important;
  }

  .el-input-number {
    width: 100% !important;
  }

  .el-table {
    font-size: 13px !important;
  }

  .el-table .cell {
    padding: 8px !important;
  }

  .el-button {
    height: 32px !important;
    padding: 0 12px !important;
    font-size: 13px !important;
  }

  .el-tag {
    transform: scale(0.9) !important;
  }
}
</style>
