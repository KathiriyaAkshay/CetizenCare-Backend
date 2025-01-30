'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'reschedule_status', {
      type: Sequelize.ENUM(['pending', 'approved', 'rejected']),
      allowNull: true
    })

    await queryInterface.addColumn('bookings', 'reschedule_reject_date', {
      type: Sequelize.DATE,
      allowNull: true
    })
    await queryInterface.addColumn('bookings', 'reschedule_reject_reason', {
      type: Sequelize.STRING,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'reschedule_status')
    await queryInterface.removeColumn('bookings', 'reschedule_reject_date')
    await queryInterface.removeColumn('bookings', 'reschedule_reject_reason')
  }
}
