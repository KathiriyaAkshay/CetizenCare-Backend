'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('chat_rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      room_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      customer_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
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
      created_by: {
        type: Sequelize.ENUM('Customer', 'Vendor')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('chat_rooms')
  }
}
