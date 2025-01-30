'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'versions',
      [
        {
          id: 'c565f35e-9b8a-4377-a0cf-e9f35fc42fb2',
          version_app_store: '1.0.0',
          version_play_store: '1.0.0',
          version_info_app_store: ' New release',
          version_info_play_store: ' New release',
          url_app_store: ' https://www.google.com',
          url_play_store: 'https://playstore.com',
          version_date_app_store: '2024-01-06T17:47:46+05:30',
          version_date_play_store: '2024-01-06T17:47:46+05:30',
          type: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'c575f35e-9b8a-4377-a0cf-e9f35fc42fb2',
          version_app_store: '1.0.0',
          version_play_store: '1.0.0',
          version_info_app_store: ' New release',
          version_info_play_store: ' New release',
          url_app_store: ' https://www.google.com',
          url_play_store: 'https://playstore.com',
          version_date_app_store: '2024-01-06T17:47:46+05:30',
          version_date_play_store: '2024-01-06T17:47:46+05:30',
          type: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('versions', null, {})
  }
}
