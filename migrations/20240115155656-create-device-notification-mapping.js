'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_notification_mappings', {
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
      customer_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      type: {
        type: Sequelize.STRING,
      },
      device: {
        type: Sequelize.ENUM("Android", "Ios"),
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
    await queryInterface.dropTable('device_notification_mappings');
  }
};