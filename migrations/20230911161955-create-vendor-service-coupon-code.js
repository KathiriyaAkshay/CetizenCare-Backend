'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_service_coupon_codes', {
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
      service: {
        type: Sequelize.UUID,
        references: {
          model: 'vendor_services',
          key: 'id'
        }
      },
      coupon_code: {
        type: Sequelize.STRING
      },
      coupon_heading: {
        type: Sequelize.STRING
      },
      coupon_description: {
        type: Sequelize.STRING
      },
      discount_percentage: {
        type: Sequelize.DECIMAL(5, 2)
      },
      maximum_amount: {
        type: Sequelize.DECIMAL(19, 5)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('vendor_service_coupon_codes')
  }
}
