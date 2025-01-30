'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class chat_data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      chat_data.belongsTo(models.chat_room, {
        foreignKey: 'room'
      })

      models.chat_room.hasMany(chat_data, {
        foreignKey: 'room',
      })
      
      chat_data.belongsTo(models.Vendor, {
        foreignKey: 'send_from_vendor'
      })

      models.Vendor.hasMany(chat_data, {
        foreignKey: 'send_from_vendor',
      })

      chat_data.belongsTo(models.Customer, {
        foreignKey: 'send_from_customer'
      })

      models.Customer.hasMany(chat_data, {
        foreignKey: 'send_from_customer',
      })
    }
  }
  chat_data.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      content: {
        type: DataTypes.TEXT
      },
      media_option: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      media: {
        type: DataTypes.TEXT
      },
      timestamp: {
        type: DataTypes.DATE
      },
      send_from_vendor: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      send_from_customer: {
        type: DataTypes.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      send_from: {
        type: DataTypes.ENUM('Customer', 'Vendor')
      },
      deleted: {
        type: DataTypes.BOOLEAN
      },
      chat_timestamp: {
        type: DataTypes.DATE
      },
      room: {
        type: DataTypes.UUID,
        references: {
          model: 'chat_room',
          key: 'room_id'
        }
      },
      is_quoted: {
        type: DataTypes.BOOLEAN
      },
      quoted_message: {
        type: DataTypes.TEXT
      },
      unread: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'chat_data'
    }
  )
  return chat_data
}
