'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // Vendor.hasMany(models.Log);
      // Vendor.hasOne(models.Vendor_Document)
    }
  }
  Vendor.init(
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
      address1: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      address2: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      vendorId: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      securityQnA: {
        type: DataTypes.JSON,
        allowNull: true
      },
      criminalQnA: {
        type: DataTypes.JSON,
        allowNull: true
      },
      proofRef: {
        type: DataTypes.JSON,
        allowNull: true
        // defaultValue: null,
        // get() {
        //   return JSON.parse(this.getDataValue("proofResources"));
        // },
        // set(value) {
        //   return this.setDataValue("proofResources", JSON.stringify(value));
        // },
      },
      isDocumentUploaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      proofRefVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
      },
      zipcode: {
        type: DataTypes.STRING
      },
      working_address_zipcode: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'Vendor'
    }
  )
  return Vendor
}
