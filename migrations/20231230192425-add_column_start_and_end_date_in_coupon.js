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
    await queryInterface.addColumn('admin_coupons', 'start_date', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('admin_coupons', 'end_date', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('vendor_coupons', 'start_date', {
      type: Sequelize.DATE,
    })

    await queryInterface.addColumn('vendor_coupons', 'end_date', {
      type: Sequelize.DATE,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('vendor_coupons', 'end_date')
    await queryInterface.removeColumn('vendor_coupons', 'start_date')
    await queryInterface.removeColumn('admin_coupons', 'end_date')
    await queryInterface.removeColumn('admin_coupons', 'start_date')
  }
}
