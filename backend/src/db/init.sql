-- 创建数据库并设置字符集
CREATE DATABASE IF NOT EXISTS cloud_monitor
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE cloud_monitor;

-- 云账户表
CREATE TABLE IF NOT EXISTS cloud_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cloud_provider ENUM('huawei', 'tencent'),
    account_name VARCHAR(100),
    balance DECIMAL(10, 2),
    currency VARCHAR(10),
    balance_type VARCHAR(20), -- 新增字段：区分现金余额和储值卡
    expire_time DATETIME,     -- 新增字段：储值卡到期时间
    batch_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 云资源表
CREATE TABLE IF NOT EXISTS cloud_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cloud_provider ENUM('huawei', 'tencent'),
    account_name VARCHAR(100),
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    resource_name VARCHAR(255),
    project_name VARCHAR(100),
    region VARCHAR(50),
    zone VARCHAR(50),
    expire_time DATETIME,
    remaining_days INT,
    status VARCHAR(20),       -- 新增字段：资源状态
    remark TEXT,             -- 新增字段：资源备注
    batch_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_resource` (cloud_provider, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 云账单表
CREATE TABLE IF NOT EXISTS cloud_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cloud_provider VARCHAR(50) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    service_type VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    billing_date DATE,
    batch_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 数据同步记录表
CREATE TABLE IF NOT EXISTS sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_type VARCHAR(50),    -- 同步类型：resources/accounts/bills
    start_time DATETIME,      -- 同步开始时间
    end_time DATETIME,        -- 同步结束时间
    status VARCHAR(20),       -- 同步状态：success/failed
    error_message TEXT,       -- 错误信息
    batch_number VARCHAR(50), -- 同步批次号
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 资源备注表
CREATE TABLE IF NOT EXISTS resource_remarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cloud_provider ENUM('huawei', 'tencent'),
    resource_id VARCHAR(100),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_resource_remark` (cloud_provider, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 