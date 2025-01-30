'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class device_notification_mapping extends Model {
    static associate (models) {
      device_notification_mapping.belongsTo(models.Customer, {
        foreignKey: 'customer_id'
      })

      models.Customer.hasMany(models.device_notification_mapping, {
        foreignKey: 'customer_id'
      })

      device_notification_mapping.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id'
      })

      models.Vendor.hasMany(models.device_notification_mapping, {
        foreignKey: 'vendor_id'
      })
    }
  }
  device_notification_mapping.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      vendor_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      customer_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.STRING
      },
      device: {
        type: DataTypes.ENUM('Android', 'Ios'),
        allowNull: true
      },
      notificationId: {
        type: DataTypes.TEXT,
      }
    },
    {
      sequelize,
      modelName: 'device_notification_mapping'
    }
  )
  return device_notification_mapping
}
