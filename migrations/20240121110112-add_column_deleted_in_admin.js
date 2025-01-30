'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SuperAdmins', 'deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('SuperAdmins', 'delete_reason', {
      type: Sequelize.STRING,
      defaultValue: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SuperAdmins', 'deleted')
    await queryInterface.removeColumn('SuperAdmins', 'delete_reason')
  }
}
