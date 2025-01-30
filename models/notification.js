'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      models.Customer.belongsTo(models.notification, {
        foreignKey: 'id'
      })

      models.notification.hasMany(models.Customer, {
        foreignKey: 'id'
      })

      models.Vendor.belongsTo(models.notification, {
        foreignKey: 'id'
      })

      models.notification.hasMany(models.Vendor, {
        foreignKey: 'id'
      })

      models.cart.belongsTo(models.notification, {
        foreignKey: 'id'
      })

      models.notification.hasMany(models.cart, {
        foreignKey: 'id'
      })

      models.vendor_service.belongsTo(models.notification, {
        foreignKey: 'id'
      })

      models.notification.hasMany(models.vendor_service, {
        foreignKey: 'id'
      })
    }
  }
  notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      person: {
        type: DataTypes.STRING,
        allowNull: false
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
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      timestamp: {
        type: DataTypes.DATE
      },
      is_read: {
        type: DataTypes.BOOLEAN
      },
      is_delete: {
        type: DataTypes.BOOLEAN
      },
      cart_id: {
        type: DataTypes.UUID,
        references: {
          model: 'cart',
          key: 'id'
        }
      },
      service_id: {
        type: DataTypes.UUID,
        references: {
          model: 'vendor_service',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'notification'
    }
  )
  return notification
}
