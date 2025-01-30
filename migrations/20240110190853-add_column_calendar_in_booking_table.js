'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'calendar_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'calendar_booking_data',
        key: 'id'
      }
    })

    await queryInterface.addColumn('vendor_services', 'intervalMinutes', {
      type: Sequelize.DECIMAL,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('carts', 'calendar_id')
    await queryInterface.removeColumn('vendor_services', 'intervalMinutes')

  }
}
