import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize'
import { dbManager } from '../config/database'

const db = dbManager.getConnection('huawei')

// 定义资源接口
interface IHuaweiResource {
  id: number
  account_name: string
  resource_type: string
  resource_name: string
  expired_time: Date
  differ_days?: number
}

// 定义模型类
export class HuaweiResource extends Model<
  InferAttributes<HuaweiResource>,
  InferCreationAttributes<HuaweiResource>
> implements IHuaweiResource {
  public id!: number
  public account_name!: string
  public resource_type!: string
  public resource_name!: string
  public expired_time!: Date
  public differ_days?: number
}

// 初始化模型
HuaweiResource.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expired_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  differ_days: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize: db,
  tableName: 'resources',
  timestamps: true
}) 