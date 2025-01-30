'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendar_booking_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      vendor_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      service_id: {
        type: Sequelize.UUID,
        references: {
          model: 'vendor_services',
          key: 'id'
        }
      },
      time_slot:{
        type: Sequelize.JSON,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable('calendar_booking_data');
  }
};