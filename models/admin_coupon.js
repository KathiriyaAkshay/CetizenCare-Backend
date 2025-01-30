'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class admin_coupon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      admin_coupon.belongsTo(models.SuperAdmin, {
        foreignKey: 'admin_id'
      })

      models.SuperAdmin.hasMany(models.admin_coupon, {
        foreignKey: 'admin_id'
      })
    }
  }
  admin_coupon.init(
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
      admin_id: {
        type: DataTypes.UUID,
        references: {
          model: 'SuperAdmin',
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
      deleted: {
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
      modelName: 'admin_coupon'
    }
  )
  return admin_coupon
}
