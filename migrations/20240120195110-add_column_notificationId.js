'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('device_notification_mappings', 'notificationId', {
      type: Sequelize.TEXT,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('device_notification_mappings', 'notificationId')
  }
}
