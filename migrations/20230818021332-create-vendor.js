'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Vendors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      middlename: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dob: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address1: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      address2: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendorId: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      securityQnA: {
        type: Sequelize.JSON,
        allowNull: true
      },
      criminalQnA: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // proofRef: {
      //   type: Sequelize.JSON,
      //   allowNull: true,
      // get() {
      //   return JSON.parse(this.getDataValue("proofResources"));
      // },
      // set(value) {
      //   return this.setDataValue("proofResources", JSON.stringify(value));
      // },
      // defaultValue:null
      // },
      isDocumentUploaded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      proofRefVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mobileVerificationCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mobileVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      mobileVerificationExpiry: Sequelize.DATE,
      emailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailVerificationOTP: Sequelize.STRING,
      emailVerificationExpiry: Sequelize.DATE,
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Vendors')
  }
}
