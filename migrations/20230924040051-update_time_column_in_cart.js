'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a new JSON column for the updated time data
    await queryInterface.addColumn('carts', 'new_time', {
      type: Sequelize.JSON,
      allowNull: true
    })

    // Copy data from the old 'time' column to the new 'new_time' column
    await queryInterface.sequelize.query(
      'UPDATE "carts" SET "new_time" = json_build_object(\'key\', "time")'
    )

    // Remove the old 'time' column
    await queryInterface.removeColumn('carts', 'time')

    // Rename the new column to 'time' if needed
    await queryInterface.renameColumn('carts', 'new_time', 'time')
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to the JSON type (same as in the 'up' method)
    await queryInterface.addColumn('carts', 'new_time', {
      type: Sequelize.JSON,
      allowNull: true
    })

    // Copy data from the 'time' column to the new 'new_time' column
    await queryInterface.sequelize.query(
      'UPDATE "carts" SET "new_time" = json_build_object(\'key\', "time")'
    )   

    // Remove the 'time' column
    await queryInterface.removeColumn('carts', 'time')

    // Rename the new column to 'time'
    await queryInterface.renameColumn('carts', 'new_time', 'time')
  }
}
