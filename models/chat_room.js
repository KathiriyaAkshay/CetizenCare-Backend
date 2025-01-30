'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class chat_room extends Model {
    static associate (models) {
      chat_room.belongsTo(models.cart, {
        foreignKey: 'cart_id'
      })

      models.cart.hasMany(chat_room, {
        foreignKey: 'cart_id'
      })

      chat_room.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id'
      })

      models.Vendor.hasMany(chat_room, {
        foreignKey: 'vendor_id'
      })

      chat_room.belongsTo(models.Customer, {
        foreignKey: 'customer_id'
      })

      models.Customer.hasMany(chat_room, {
        foreignKey: 'customer_id'
      })
    }
  }
  chat_room.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      room_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      customer_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Customer',
          key: 'id'
        }
      },
      vendor_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      cart_id: {
        type: DataTypes.UUID,
        references: {
          model: 'cart',
          key: 'id'
        }
      },
      created_by: {
        type: DataTypes.ENUM('Customer', 'Vendor')
      },
      vendor_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customer_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'chat_room'
    }
  )
  return chat_room
}
