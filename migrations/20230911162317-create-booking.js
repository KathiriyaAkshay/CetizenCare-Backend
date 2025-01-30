'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      booking_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      tip: {
        type: Sequelize.DECIMAL(19, 5).UNSIGNED
      },
      customer: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      coupon_code: {
        type: Sequelize.UUID,
        references: {
          model: 'vendor_service_coupon_codes',
          key: 'id'
        }
      },
      address1: {
        type: Sequelize.TEXT
      },
      address12: {
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
    await queryInterface.dropTable('bookings')
  }
}
