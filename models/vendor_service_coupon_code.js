'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_service_coupon_code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      vendor_service_coupon_code.belongsTo(models.Vendor, {
        foreignKey: 'vendor'
      })

      models.Vendor.hasMany(models.vendor_service_coupon_code, {
        foreignKey: 'vendor',
        as: 'coupon_code'
      })

      // vendor_service_coupon_code.belongsToMany(models.Vendor, {
      //   through:'vendor_coupon_associate'
      // })

      // models.Vendor.belongsToMany(models.vendor_service_coupon_code, {
      //  through: 'vendor_coupon_associate'

      // })

      vendor_service_coupon_code.belongsTo(models.vendor_service, {
        foreignKey: 'service',
        as: 'coupon_service'
      })

      models.vendor_service.hasMany(models.vendor_service_coupon_code, {
        foreignKey: 'service',
        as: 'service_coupon'
      })

      //     vendor_service_coupon_code.belongsToMany(models.vendor_service, {
      //   through: 'service_coupon_associate'
      // })

      // models.vendor_service.belongsToMany(models.vendor_service_coupon_code, {
      //   through: 'service_coupon_associate'

      // })
    }
  }
  vendor_service_coupon_code.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      vendor: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      service: {
        type: DataTypes.UUID,
        references: {
          model: 'vendor_service',
          key: 'id'
        }
      },
      coupon_code: {
        type: DataTypes.STRING
      },
      coupon_heading: {
        type: DataTypes.STRING
      },
      coupon_description: {
        type: DataTypes.STRING
      },
      discount_percentage: {
        type: DataTypes.DECIMAL(5, 2)
      },
      maximum_amount: {
        type: DataTypes.DECIMAL(19, 5)
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'vendor_service_coupon_code'
    }
  )
  return vendor_service_coupon_code
}
