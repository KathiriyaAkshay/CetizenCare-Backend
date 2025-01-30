'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('booking_addresses', 'address_img', {
      type: Sequelize.STRING,
      allowNull: true
    })
    await queryInterface.addColumn('customer_addresses', 'address_img', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('vendor_postal_addresses', 'address_img', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('booking_addresses', 'address_img')
    await queryInterface.removeColumn('customer_addresses', 'address_img')
    await queryInterface.removeColumn('vendor_postal_addresses', 'address_img')
  }
}
