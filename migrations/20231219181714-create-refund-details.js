'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refund_details', {
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
      refund_id: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      charge_id: {
        type: Sequelize.STRING
      },
      payment_intent_id: {
        type: Sequelize.STRING
      },
      receipt_url: {
        type: Sequelize.TEXT
      },
      amount: {
        type: Sequelize.DECIMAL(19, 5).UNSIGNED,
        allowNull: false,
        default: 0.0
      },
      destination_details: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('refund_details');
  }
};