'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_coupon_codes', {
      id: {
       type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      offer_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      offer_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2).UNSIGNED,
        allowNull: false
      },
      offer_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      maxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      maxDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_coupon_codes');
  }
};