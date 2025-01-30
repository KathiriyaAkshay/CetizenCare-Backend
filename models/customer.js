'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  Customer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      profile_img: {
        type: DataTypes.STRING,
        allowNull: true
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      middlename: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dob: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mobileVerificationCode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mobileVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      mobileVerificationExpiry: DataTypes.DATE,
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      customerId: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      securityQnA: {
        type: DataTypes.JSON,
        allowNull: true
      },
      emailVerificationOTP: DataTypes.STRING,
      emailVerificationExpiry: DataTypes.DATE,
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resetPasswordExpiry: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      delete_reason: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'Customer'
    }
  )
  return Customer
}
