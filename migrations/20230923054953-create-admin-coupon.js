'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_coupons', {
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
      admin_id: {
        type: Sequelize.UUID,
        references: {
          model: 'SuperAdmins',
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
    await queryInterface.dropTable('admin_coupons');
  }
};