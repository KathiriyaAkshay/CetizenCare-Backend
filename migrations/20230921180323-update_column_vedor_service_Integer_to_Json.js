'use strict'

const models = require('../models') // Import your Sequelize models

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('vendor_services', 'new_experience', {
      type: Sequelize.JSON,
      allowNull: true
    })

    // Copy data from the old 'experience' column to the new 'new_experience' column
    await queryInterface.sequelize.query(
      'UPDATE "vendor_services" SET "new_experience" = json_build_object(\'key\', "experience")'
    )

    // Remove the old 'experience' column
    await queryInterface.removeColumn('vendor_services', 'experience')

    // Rename the new column to 'experience' if needed
    await queryInterface.renameColumn(
      'vendor_services',
      'new_experience',
      'experience'
    )
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to the JSON type (same as in the 'up' method)
    await queryInterface.addColumn('vendor_services', 'new_experience', {
      type: Sequelize.JSON,
      allowNull: true
    })

    // Copy data from the 'experience' column to the new 'new_experience' column
    await queryInterface.sequelize.query(
      'UPDATE "vendor_services" SET "new_experience" = json_build_object(\'key\', "experience")'
    )

    // Remove the 'experience' column
    await queryInterface.removeColumn('vendor_services', 'experience')

    // Rename the new column to 'experience'
    await queryInterface.renameColumn(
      'vendor_services',
      'new_experience',
      'experience'
    )
  }
}
