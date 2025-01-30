'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('admin_coupons', 'maxAmount', {
      type: Sequelize.DECIMAL(10, 2), 
      allowNull: true 
    });

    await queryInterface.addColumn('admin_coupons', 'maxDiscount', {
      type: Sequelize.DECIMAL(10, 2), 
      allowNull: true 
    });
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.removeColumn('admin_coupons', 'maxAmount');
    await queryInterface.removeColumn('admin_coupons', 'maxDiscount');
  }
}
