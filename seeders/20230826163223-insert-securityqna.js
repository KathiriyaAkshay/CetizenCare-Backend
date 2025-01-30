'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SecurityQnAs', [
      {
      question: "What is your Hometown?",
      option: "security"
    },
    {
      question: "What is 1st Pet Name?",
      option: "security"
    },
    {
      question: "What is your Best Friend?",
      option: "security"
    },
    {
      question: "Have you ever been convicted of a felony or misdemeanor? if yes, please provide details of the offense and the outcome.",
      option: "criminal_record"
    },
    {
      question: "Do you have any ongoing legal issues or pending criminal cases that may affect your ability to provide services?",
      option: "criminal_record"
    },
    {
      question: "Have you been previously banned or removed from any other service platform due to violations of their policies or unethical behavior?",
      option: "criminal_record"
    },
    {
      question: "Can you provide references or past clients who can vouch for the quality of your services and professionalism?",
      option: "criminal_record"
    },
    {
      question: "Are you licensed, certified, or registered to offer the specific services you plan to provide on our platform? if yes, please share relevant documentation",
      option: "criminal_record"
    }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('SecurityQnAs', null, {});
  }
};
