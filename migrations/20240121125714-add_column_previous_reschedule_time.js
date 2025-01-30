'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'previous_reschedule_time', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    })

    await queryInterface.addColumn('carts', 'previous_reschedule_date', {
      type: Sequelize.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('carts', 'previous_reschedule_time')
    await queryInterface.removeColumn('carts', 'previous_reschedule_date')
  }
}
