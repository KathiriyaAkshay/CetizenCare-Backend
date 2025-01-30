'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('vendor_services', 'service_json', {
      type: Sequelize.JSON,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.removeColumn('vendor_services', 'service_json')
  }
}
