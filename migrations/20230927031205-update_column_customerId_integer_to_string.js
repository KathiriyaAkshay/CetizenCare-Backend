'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add a new column with the desired datatype
    await queryInterface.addColumn('Customers', 'new_customerId', {
      type: Sequelize.STRING,
      allowNull: true // Modify this as needed based on your requirements
    })

    // Step 2: Copy data from the old column to the new column
    await queryInterface.sequelize.query(
      'UPDATE "Customers" SET "new_customerId" = CAST("customerId" AS VARCHAR)'
    )

    // Step 3: Remove the old column
    await queryInterface.removeColumn('Customers', 'customerId')

    // Step 4: Rename the new column to the old column name
    await queryInterface.renameColumn(
      'Customers',
      'new_customerId',
      'customerId'
    )
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes in the opposite order

    // Step 1: Remove the new column
    await queryInterface.removeColumn('Customers', 'customerId')

    // Step 2: Add the old column back with the integer datatype
    await queryInterface.addColumn('Customers', 'customerId', {
      type: Sequelize.INTEGER
    })
  }

};
