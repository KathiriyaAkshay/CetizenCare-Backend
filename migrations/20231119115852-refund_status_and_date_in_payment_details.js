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
    await queryInterface.addColumn('payment_details', 'refund_status', {
      type: Sequelize.ENUM('pending', 'done'),
      allowNull: true
    })

    await queryInterface.addColumn('payment_details', 'refund_date', {
      type: Sequelize.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('payment_details', 'refund_status')
    await queryInterface.removeColumn('payment_details', 'refund_date')
  }
}
