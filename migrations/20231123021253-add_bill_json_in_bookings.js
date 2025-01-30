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
    await queryInterface.addColumn('bookings', 'bill_json', {
      type: Sequelize.JSON,
      allowNull: true
    })

    await queryInterface.addColumn('carts', 'rejected_date', {
      type: Sequelize.DATE,
      allowNull: true
    })

    await queryInterface.addColumn('bookings', 'cancel_stage', {
      type: Sequelize.ENUM('before_payment', 'after_payment'),
      allowNull: true
    })

    await queryInterface.addColumn('bookings', 'refund_status', {
      type: Sequelize.ENUM('Pending', 'Done'),
      allowNull: true
    })

    await queryInterface.addColumn('bookings', 'refund_date', {
      type: Sequelize.DATE,
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
    await queryInterface.removeColumn('bookings', 'refund_date')
    await queryInterface.removeColumn('bookings', 'refund_status')
    await queryInterface.removeColumn('bookings', 'cancel_stage')
    await queryInterface.removeColumn('carts', 'rejected_date')
    await queryInterface.removeColumn('bookings', 'bill_json')
  }
}
