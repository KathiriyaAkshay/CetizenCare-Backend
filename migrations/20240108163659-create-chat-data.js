'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('chat_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      content: {
        type: Sequelize.TEXT
      },
      media_option: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      media: {
        type: Sequelize.TEXT
      },
      timestamp: {
        type: Sequelize.DATE
      },
      send_from_vendor: {
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      send_from_customer: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      send_from: {
        type: Sequelize.ENUM('Customer', 'Vendor')
      },
      deleted: {
        type: Sequelize.BOOLEAN
      },
      chat_timestamp: {
        type: Sequelize.DATE
      },
      room: {
        type: Sequelize.UUID,
        references: {
          model: 'chat_rooms',
          key: 'room_id'
        }
      },
      is_quoted: {
        type: Sequelize.BOOLEAN
      },
      quoted_message: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('chat_data')
  }
}
