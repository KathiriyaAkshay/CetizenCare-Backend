'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('booking_addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      booking: {
        type: Sequelize.UUID,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      address1: {
        type: Sequelize.TEXT
      },
      address2: {
        type: Sequelize.TEXT
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pincode: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      addressName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DOUBLE
      },
      longitude: {
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('booking_addresses')
  }
}
