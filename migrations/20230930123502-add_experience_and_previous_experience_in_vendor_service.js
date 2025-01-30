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
    await queryInterface.renameColumn(
      'vendor_services',
      'experience',
      'previous_experience'
    )

    await queryInterface.addColumn('vendor_services', 'experience', {
      type: Sequelize.INTEGER,
      allowNull: true // Modify this as per your requirements
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('vendor_services', 'experience')
    await queryInterface.renameColumn(
      'vendor_services',
      'previous_experience',
      'experience'
    )
  }
}
