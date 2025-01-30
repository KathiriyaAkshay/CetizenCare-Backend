'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_notification_settings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  vendor_notification_settings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      enable_all: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      news_letter_email: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      promos_offers_email: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      promos_offers_push: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      promos_offers_whatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      social_notification: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customer: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'vendor_notification_settings'
    }
  )
  return vendor_notification_settings
}
