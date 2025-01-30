'use strict'
// Migration file for service_id to cart_id column change
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('chat_rooms', 'service_id', 'cart_id')
    await queryInterface.changeColumn('chat_rooms', 'cart_id', {
      type: Sequelize.UUID,
      references: {
        model: 'carts', // Change the reference table name if needed
        key: 'id'
      },
      allowNull: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('chat_rooms', 'cart_id', {
      type: Sequelize.UUID,
      references: {
        model: 'vendor_services',
        key: 'id'
      },
      allowNull: false 
    })
    await queryInterface.renameColumn('chat_rooms', 'cart_id', 'service_id')
  }
}
