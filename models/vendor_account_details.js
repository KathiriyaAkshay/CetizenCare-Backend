'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class vendor_account_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

        vendor_account_details.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id'
      })

      models.Vendor.hasMany(vendor_account_details, {
        foreignKey: 'vendor_id'
      })

    }
  }
  vendor_account_details.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      vendor_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      account_number: {
        type: DataTypes.STRING,
        unique: true
      },
      name: {
        type: DataTypes.STRING
      },
      mobile_number: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      zip_code: {
        type: DataTypes.STRING
      },
      bank_name: {
        type: DataTypes.STRING,
      },
      mode: {
        type: DataTypes.STRING,
        defaultValue: 'secondary'
      },
      routing_number: {
        type: DataTypes.STRING
      }
    }, {
    sequelize,
    modelName: 'vendor_account_details',
  });
  return vendor_account_details;
};