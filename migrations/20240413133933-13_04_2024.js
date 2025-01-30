'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'latitude', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('carts', 'longitude', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('carts', 'longitude')
    await queryInterface.removeColumn('carts', 'latitude')
  }
};
