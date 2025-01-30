'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class calendar_booking_data extends Model {
    static associate (models) {
      calendar_booking_data.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id'
      })

      models.Vendor.hasMany(models.calendar_booking_data, {
        foreignKey: 'vendor_id'
      })
      calendar_booking_data.belongsTo(models.vendor_service, {
        foreignKey: 'service_id'
      })

      models.vendor_service.hasMany(models.calendar_booking_data, {
        foreignKey: 'service_id'
      })
    }
  }
  calendar_booking_data.init(
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
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      payment_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'calendar_booking_data'
    }
  )
  return calendar_booking_data
}
