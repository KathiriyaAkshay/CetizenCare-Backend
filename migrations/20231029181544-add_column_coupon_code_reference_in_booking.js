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
    await queryInterface.addColumn('bookings', 'new_coupon_code', {
      type: Sequelize.UUID,
      references: {
        model: 'booking_coupon_codes',
        key: 'id'
      }
    })

    await queryInterface.removeColumn('bookings', 'coupon_code')

    await queryInterface.renameColumn(
      'bookings',
      'new_coupon_code',
      'coupon_code'
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('bookings', 'coupon_code')

    // Step 2: Add the old column back with the integer datatype
    await queryInterface.addColumn('bookings', 'coupon_code', {
      type: Sequelize.UUID
    })
  }
}
