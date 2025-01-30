'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_coupon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      vendor_coupon.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id'
      })

      models.Vendor.hasMany(models.vendor_coupon, {
        foreignKey: 'vendor_id'
      })
    }
  }
  vendor_coupon.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      offer_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      offer_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2).UNSIGNED,
        allowNull: false
      },
      offer_code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      image: {
        type: DataTypes.STRING
      },
      bg_color: {
        type: DataTypes.STRING,
        defaultValue: '#baeb34'
      },
      vendor_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      maxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      deleted:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      start_date: {
        type: DataTypes.DATE
      },
      end_date: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'vendor_coupon'
    }
  )
  return vendor_coupon
}
