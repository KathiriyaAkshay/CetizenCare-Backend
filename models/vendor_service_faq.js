'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_service_faq extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      vendor_service_faq.belongsTo(models.vendor_service, {
        foreignKey: 'service',
        as: 'vendor'
      })

      models.vendor_service.hasMany(models.vendor_service_faq, {
        foreignKey: 'service',
        as: 'faq_vendor_service'
      })
    }
  }
  vendor_service_faq.init(
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
          model: 'service',
          key: 'id'
        }
      },
      question: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'vendor_service_faq'
    }
  )
  return vendor_service_faq
}
