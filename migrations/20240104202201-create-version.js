'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('versions', {
       id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      version_app_store: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      version_play_store: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      url_app_store: {
        type: Sequelize.STRING,
        allowNull: true
      },
      url_play_store: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version_info_app_store: {
        type: Sequelize.STRING,
        allowNull: true
      },
      version_info_play_store: {
        type: Sequelize.STRING,
        allowNull: true
      },
      version_date_app_store: {
        type: Sequelize.DATE,
      },
      version_date_play_store: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('versions');
  }
};