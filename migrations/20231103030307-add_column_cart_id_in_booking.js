'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('booking_addresses', 'state', {
      type: Sequelize.STRING
    })
    
    await queryInterface.addColumn('bookings', 'address_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'booking_addresses',
        key: 'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('bookings', 'address_id')

    await queryInterface.removeColumn('booking_addresses', 'state')
  }
}
