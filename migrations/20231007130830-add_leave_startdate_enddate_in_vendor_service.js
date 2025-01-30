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
    await queryInterface.addColumn('vendor_services', 'leave_start_date', {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.addColumn('vendor_services', 'leave_end_date', {
      type: Sequelize.STRING,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('vendor_services', 'leave_end_date')
    await queryInterface.removeColumn('vendor_services', 'leave_start_date')
  }
}
