'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_notification_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      enable_all: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      news_letter_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      promos_offers_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      promos_offers_push: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      promos_offers_whatsapp: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      social_notification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      customer: {
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
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('vendor_notification_settings')
  }
}
