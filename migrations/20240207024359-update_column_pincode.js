'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('customer_addresses', 'pincode', {
      type: Sequelize.STRING,
      allowNull: false
    })
    await queryInterface.changeColumn('vendor_postal_addresses', 'pincode', {
      type: Sequelize.STRING,
      allowNull: false
    })

    await queryInterface.changeColumn('bookings', 'pincode', {
      type: Sequelize.STRING,
      allowNull: false
    })

    await queryInterface.changeColumn('booking_addresses', 'pincode', {
      type: Sequelize.STRING,
      allowNull: false
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
}
