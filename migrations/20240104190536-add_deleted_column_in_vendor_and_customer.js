'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Customers', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('Vendors', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('Customers', 'delete_reason', {
      type: Sequelize.STRING
    })

    await queryInterface.addColumn('Vendors', 'delete_reason', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Customers', 'deleted')
    await queryInterface.removeColumn('Vendors', 'deleted')
    await queryInterface.removeColumn('Customers', 'delete_reason')
    await queryInterface.removeColumn('Vendors', 'delete_reason')
  }
}
