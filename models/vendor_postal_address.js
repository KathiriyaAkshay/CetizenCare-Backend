'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vendor_postal_address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      vendor_postal_address.belongsTo(models.vendor_service, {
        foreignKey: 'service',
        as: 'vendor_service_postal'
      })

      models.vendor_service.hasMany(models.vendor_postal_address, {
        foreignKey: 'service',
        as: 'postal_vendor_service'
      })

      vendor_postal_address.belongsTo(models.Vendor, {
        foreignKey: 'vendor',
        as: 'postal_vendor'
      })

      models.Vendor.hasMany(models.vendor_postal_address, {
        foreignKey: 'vendor',
        as: 'vendor_postal'
      })

    }
  }
  vendor_postal_address.init(
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
      vendor: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      addressName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address1: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      address2: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE
      },
      longitude: {
        type: DataTypes.DOUBLE
      },
      address_img: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'vendor_postal_address'
    }
  )
  return vendor_postal_address
}
