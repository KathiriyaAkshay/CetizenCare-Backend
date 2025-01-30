'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SecurityQnAs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    question: {
        type: Sequelize.STRING
    },
    option: {
        type: Sequelize.ENUM(["security", "criminal_record"]),
        allowNull: false
    }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SecurityQnAs');
  }
};