'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'location_status', {
      type: Sequelize.ENUM('pending', 'start', 'complete'),
      defaultValue: 'pending'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('carts', 'location_status')
  }
}
