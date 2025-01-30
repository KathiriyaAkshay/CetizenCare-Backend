'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_calendar_data extends Model {
    static associate (models) {
      vendor_calendar_data.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id'
      })

      models.Vendor.hasMany(models.vendor_calendar_data, {
        foreignKey: 'vendor_id'
      })
      vendor_calendar_data.belongsTo(models.vendor_service, {
        foreignKey: 'service_id'
      })

      models.vendor_service.hasMany(models.vendor_calendar_data, {
        foreignKey: 'service_id'
      })
    }
  }
  vendor_calendar_data.init(
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
          model: 'Vendor',
          key: 'id'
        }
      },
      service_id: {
        type: DataTypes.UUID,
        references: {
          model: 'vendor_service',
          key: 'id'
        }
      },
      time_slot: {
        type: DataTypes.STRING,
        allowNull: false
      },
      activate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'vendor_calendar_data'
    }
  )
  return vendor_calendar_data
}
