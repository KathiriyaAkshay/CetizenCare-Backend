'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
    person : {
        type: Sequelize.STRING,
        allowNull: false
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
    title: {
        type: Sequelize.STRING,
        allowNull: true
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    timestamp: {
        type: Sequelize.DATE,
    },
    is_read: {
        type: Sequelize.BOOLEAN
    },
    is_delete: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('notifications');
  }
};