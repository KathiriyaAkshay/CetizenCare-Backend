'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'new_bookingId', {
      type: Sequelize.UUID,
      references: {
          model: 'bookings',
          key: 'id'
        }
    })

    await queryInterface.sequelize.query(
      'UPDATE "carts" SET "new_bookingId" = booking_id'
    )

    await queryInterface.removeColumn('carts', 'booking_id')

    await queryInterface.renameColumn(
      'carts',
      'new_bookingId',
      'booking_id'
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('carts', 'booking_id')

    // Step 2: Add the old column back with the integer datatype
    await queryInterface.addColumn('carts', 'booking_id', {
      type: Sequelize.UUID
    })
  }
}
