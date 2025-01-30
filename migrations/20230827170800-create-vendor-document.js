'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vendor_Documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      dl_front: {
        type:Sequelize.BLOB('long'),
        allowNull: true,
      },
      dl_back: {
        type:Sequelize.BLOB('long'),
        allowNull: true,
      },
      ssn_img: {
        type:Sequelize.BLOB('long'),
        allowNull: true,
      },
      sli_img: {
        type:Sequelize.BLOB('long'),
        allowNull: true,
      },
      vendor_id:{
        type: Sequelize.UUID,
        references: {
          model: 'Vendors',
          key: 'id',
        },
      }
      ,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vendor_Documents');
  }
};