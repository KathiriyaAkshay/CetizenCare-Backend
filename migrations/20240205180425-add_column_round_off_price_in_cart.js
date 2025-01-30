'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'round_off_price', {
      type: Sequelize.DECIMAL(19, 5).UNSIGNED,
      defaultValue: 0.0
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('carts', 'round_off_price')
  }
}
