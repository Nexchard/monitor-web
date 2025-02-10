import { SyncService } from '../services/sync.service';
import { CronJob } from 'cron';

const syncService = new SyncService();

export function setupSyncTasks() {
  // 创建定时任务
  const syncJob = new CronJob(
    process.env.SYNC_CRON || '0 * * * *',
    async () => {
      try {
        await syncService.syncAll();
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    },
    null,
    false,
    'Asia/Shanghai'
  );

  // 启动定时任务
  syncJob.start();
  console.log(`Sync task scheduled with cron: ${process.env.SYNC_CRON || '0 * * * *'}`);

  // 如果配置了立即同步，则立即执行一次
  if (process.env.IMMEDIATE_SYNC === 'true') {
    console.log('Running immediate sync...');
    syncService.syncAll().catch(error => {
      console.error('Immediate sync failed:', error);
    });
  }
} 