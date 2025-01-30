'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_service_reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      service: {
        type: Sequelize.UUID,
        references: {
          model: 'vendor_services',
          key: 'id'
        }
      },
      rating: {
        type: Sequelize.DECIMAL(3, 1)
      },
      comment: {
        type: Sequelize.TEXT
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      customer: {
        type: Sequelize.UUID,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      vendor: {
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
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
    await queryInterface.dropTable('vendor_service_reviews')
  }
}
