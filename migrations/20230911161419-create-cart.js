'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      vendor: {
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      customer: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      service: {
        type: Sequelize.UUID,
        references: {
          model: 'vendor_services',
          key: 'id'
        }
      },
      description: {
        type: Sequelize.TEXT
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date: {
        type: Sequelize.DATE
      },
      price: {
        type: Sequelize.DECIMAL(19, 5).UNSIGNED,
        allowNull: false
      },
      booking_time: {
        type: Sequelize.DATE
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.UUID
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
    await queryInterface.dropTable('carts')
  }
}
