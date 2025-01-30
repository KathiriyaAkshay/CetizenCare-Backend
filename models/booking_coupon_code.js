'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class booking_coupon_code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  booking_coupon_code.init({
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
      maxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      create_by: {
        type: DataTypes.STRING
      }
  }, {
    sequelize,
    modelName: 'booking_coupon_code',
  });
  return booking_coupon_code;
};