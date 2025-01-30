'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_service_review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      vendor_service_review.belongsTo(models.vendor_service, {
        foreignKey: 'service'
      })

      models.vendor_service.hasMany(models.vendor_service_review, {
        foreignKey: 'service'
      })

      vendor_service_review.belongsTo(models.Customer, {
        foreignKey: 'customer'
      })

      models.Customer.hasMany(models.vendor_service_review, {
        foreignKey: 'customer'
      })

      vendor_service_review.belongsTo(models.Vendor, {
        foreignKey: 'vendor'
      })

      models.Vendor.hasMany(models.vendor_service_review, {
        foreignKey: 'vendor'
      })
    }
  }
  vendor_service_review.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      service: {
        type: DataTypes.UUID,
        references: {
          model: 'vendor_service',
          key: 'id'
        }
      },
      rating: {
        type: DataTypes.DECIMAL(3, 1)
      },
      comment: {
        type: DataTypes.TEXT
      },
      time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      images: {
        type: DataTypes.JSON
      },
      customer: {
        type: DataTypes.UUID,
        references: {
          model: 'Customer',
          key: 'id'
        }
      },
      vendor: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'vendor_service_review'
    }
  )
  return vendor_service_review
}
