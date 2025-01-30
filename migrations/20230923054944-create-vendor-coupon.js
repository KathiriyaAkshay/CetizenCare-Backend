'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      offer_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      offer_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2).UNSIGNED,
        allowNull: false
      },
      offer_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING,
      },
      bg_color: {
        type: Sequelize.STRING,
        defaultValue: '#baeb34'
      },
      vendor_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id'
        }
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
    await queryInterface.dropTable('vendor_coupons');
  }
};