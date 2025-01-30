'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chat_rooms', 'customer_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('chat_rooms', 'vendor_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chat_rooms', 'customer_deleted')
    await queryInterface.removeColumn('chat_rooms', 'vendor_deleted')
  }
}
