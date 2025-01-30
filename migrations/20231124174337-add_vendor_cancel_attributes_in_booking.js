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
    await queryInterface.addColumn('bookings', 'vendor_cancel_stage', {
      type: Sequelize.ENUM('before_payment', 'after_payment'),
      allowNull: true
    })
    await queryInterface.addColumn('bookings', 'vendor_cancel_reason', {
      type: Sequelize.TEXT
    })

    await queryInterface.addColumn('bookings', 'vendor_cancel_date', {
      type: Sequelize.DATE
    })

    return queryInterface.sequelize.transaction(t => {
      return queryInterface.sequelize.query(
        'ALTER TYPE "enum_bookings_status" ADD VALUE \'Vendor_Cancel\'',
        { transaction: t }
      )
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('bookings', 'vendor_cancel_date')
    await queryInterface.removeColumn('bookings', 'vendor_cancel_reason')
    await queryInterface.removeColumn('bookings', 'vendor_cancel_stage')
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.sequelize.query(
        "DELETE FROM pg_enum WHERE enumlabel = 'Vendor_Cancel' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_bookings_status')",
        { transaction: t }
      )
    })
  }
}
