'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chat_data', 'unread', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chat_data', 'unread')
  }
}
