'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_details', {
      id: {
         type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      booking_id: {
         type: Sequelize.UUID,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      time: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.DECIMAL(19, 5).UNSIGNED,
        allowNull: false,
        defaultValue: 0.0
      },
      status: {
         type: Sequelize.ENUM('successful', 'failed', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'card'
      },
      trasaction_id: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('payment_details');
  }
};