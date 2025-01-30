'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_details', 'payment_intent_id', {
      type: Sequelize.STRING
    })

    await queryInterface.addColumn(
      'payment_details',
      'payment_intent_created_at',
      {
        type: Sequelize.STRING
      }
    )

    await queryInterface.addColumn('payment_details', 'payment_intent_amount', {
      type: Sequelize.DECIMAL(19, 5).UNSIGNED // Modify the datatype as needed
    })

    await queryInterface.addColumn('payment_details', 'payment_intent_status', {
      type: Sequelize.ENUM('success', 'failed', 'neutral'),
      defaultValue: 'neutral'
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('payment_details', 'payment_intent_id')
    await queryInterface.removeColumn(
      'payment_details',
      'payment_intent_created_at'
    )
    await queryInterface.removeColumn(
      'payment_details',
      'payment_intent_amount'
    )
    await queryInterface.removeColumn(
      'payment_details',
      'payment_intent_status'
    )
  }
}
