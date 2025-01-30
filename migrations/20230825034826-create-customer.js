'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customers', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        firstname: {
          type: Sequelize.STRING,
          allowNull: false
        },
        middlename:{
          type: Sequelize.STRING,
          allowNull: true
        },
        lastname:{ 
          type: Sequelize.STRING,
          allowNull: false
        },
        dob: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
         type: Sequelize.STRING,
         allowNull: false,
        },
        mobileNumber: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: false,
        },   
        customerId: {
          type: Sequelize.INTEGER,
        },
        password: {
         type: Sequelize.STRING,
        },
        securityQnA: {
          type: Sequelize.JSON,
          allowNull: true
        },
        mobileVerificationCode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mobileVerified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        mobileVerificationExpiry: Sequelize.DATE,
        emailVerified: {
         type: Sequelize.BOOLEAN,
         allowNull:false,
         defaultValue: false
        },
        emailVerificationOTP: Sequelize.STRING,
        emailVerificationExpiry: Sequelize.DATE,
        refreshToken: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        resetPasswordToken: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        resetPasswordExpiry: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Customers');
  }
};