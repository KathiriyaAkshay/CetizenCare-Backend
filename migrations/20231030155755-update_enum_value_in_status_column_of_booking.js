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
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.sequelize.query(
        'ALTER TYPE "enum_bookings_status" ADD VALUE \'Reschedule\'',
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
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.sequelize.query(
        "DELETE FROM pg_enum WHERE enumlabel = 'Reschedule' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_bookings_status')",
        { transaction: t }
      )
    })
  }
}
