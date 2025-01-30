'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      category: {
        type: Sequelize.UUID,
        references: {
          model: 'Categories',
          key: 'id'
        }
      },
      subcategory: {
        type: Sequelize.UUID,
        references: {
          model: 'sub_categories',
          key: 'id'
        }
      },
      price: {
        type: Sequelize.DECIMAL(19, 5).UNSIGNED,
        allowNull: false
      },
      experience: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      timeslot: {
        type: Sequelize.JSON,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      images: {
        type: Sequelize.JSON
      },
      rating: {
        type: Sequelize.DECIMAL(3, 1)
      },
      vendor: {
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
      },
      included_details: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('vendor_services')
  }
}
