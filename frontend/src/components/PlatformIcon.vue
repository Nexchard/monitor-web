<template>
  <span 
    class="platform-icon" 
    :class="`platform-icon--${platform}`"
  >
    <component :is="iconComponent" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CloudPlatform } from '../types'
import { SiHuawei, SiTencentqq } from 'vue-icons-plus/si'

const props = defineProps<{
  platform: CloudPlatform
  color?: string
}>()

const iconComponent = computed(() => {
  switch (props.platform) {
    case CloudPlatform.TENCENT:
      return SiTencentqq
    case CloudPlatform.HUAWEI:
      return SiHuawei
    default:
      return SiTencentqq
  }
})
</script>

<style scoped>
.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

.platform-icon--tencent {
  color: #00a4ff;
}

.platform-icon--huawei {
  color: #ff0000;
}
</style> 