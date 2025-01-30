'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class booking_address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  booking_address.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      address1: {
        type: DataTypes.TEXT
      },
      address2: {
        type: DataTypes.TEXT
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
      addressName: {
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
      },
    },
    {
      sequelize,
      modelName: 'booking_address'
    }
  )
  return booking_address    
}
