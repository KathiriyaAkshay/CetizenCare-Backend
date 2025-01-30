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
    await queryInterface.addColumn('payment_details', 'payment_intent_canceled_at', {
      type: Sequelize.STRING
    })

    await queryInterface.addColumn(
      'payment_details',
      'payment_intent_cancellation_reason',
      {
        type: Sequelize.STRING
      }
    )

    await queryInterface.addColumn('payment_details', 'payment_success_time', {
      type: Sequelize.STRING,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('payment_details', 'payment_intent_canceled_at')
    await queryInterface.removeColumn(
      'payment_details',
      'payment_intent_cancellation_reason'
    )
    await queryInterface.removeColumn(
      'payment_details',
      'payment_success_time'
    )
    
  }
}
