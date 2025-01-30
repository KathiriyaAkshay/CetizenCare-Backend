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
    await queryInterface.addColumn('Vendors', 'profile_img', {
      type: Sequelize.STRING, // You can adjust the data type as needed
      allowNull: true // Modify as per your requirements
    })
    await queryInterface.addColumn('Customers', 'profile_img', {
      type: Sequelize.STRING, // You can adjust the data type as needed
      allowNull: true // Modify as per your requirements
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('Customers', 'profile_img')
    await queryInterface.removeColumn('Vendors', 'profile_img')
  }
}
