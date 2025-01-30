'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await queryInterface.addColumn('vendor_coupons', 'maxAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true 
    });

    await queryInterface.addColumn('vendor_coupons', 'maxDiscount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
   
    await queryInterface.removeColumn('vendor_coupons', 'maxAmount');
    await queryInterface.removeColumn('vendor_coupons', 'maxDiscount');
  }
}
