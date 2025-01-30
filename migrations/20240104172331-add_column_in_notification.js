'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'cart_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'carts',
        key: 'id'
      }
    })

    await queryInterface.addColumn('notifications', 'service_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'vendor_services',
        key: 'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('notifications', 'cart_id')
    await queryInterface.removeColumn('notifications', 'service_id')
  }
}
