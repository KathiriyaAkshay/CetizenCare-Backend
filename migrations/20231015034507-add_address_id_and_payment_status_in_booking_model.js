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

    await queryInterface.addColumn('bookings', 'payment_status', {
      type: Sequelize.ENUM('paid', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    })

    await queryInterface.changeColumn('bookings', 'coupon_code', {
      type: Sequelize.UUID,
      references: {
        model: 'vendor_coupons', // Update the reference model name
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
    await queryInterface.removeColumn('bookings', 'payment_status')
    await queryInterface.changeColumn('bookings', 'coupon_code', {
      type: Sequelize.UUID,
      references: {
        model: 'vendor_service_coupon_codes', // Restore the original reference model name if needed
        key: 'id'
      }
    })
  }
}
