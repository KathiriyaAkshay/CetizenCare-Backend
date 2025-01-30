'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('versions', 'version_app_store', {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.changeColumn('versions', 'version_play_store', {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.changeColumn('terms_conditions', 'terms', {
      type: Sequelize.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {}
}
