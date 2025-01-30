'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      'terms_conditions',
      [
        {
          id: 'd6deec82-ef30-4356-babd-e6e5ab473c1e',
          terms:
            'Introduction: Welcome to the CetizenCare Vendor Platform. These Terms and Conditions govern your access to and use of our vendor services and platform. By accessing or using the platform, you agree to be bound by these Terms.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '407463ee-7691-4771-96b3-9d80ddae37e2',
          terms:
            'Vendor Eligibility: Use of the CetizenCare Vendor Platform is restricted to parties that can lawfully enter into and form contracts under applicable law. By using this platform, you represent that you qualify as such and have the authority to represent any business entity you are acting on behalf of.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2bfb1a9c-4e7d-45f2-b2e9-8c7c17e8e619',
          terms:
            'Privacy and Data Protection: Your privacy and data protection are paramount. Our Privacy Policy details how we handle and protect your personal and business information.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'a5631f21-88df-4d86-b5f7-9f8b043c7bfe',
          terms:
            'Account Registration and Use: 1. Account Creation: You must register an account to access our services, agreeing to provide accurate, current, and complete information. 2. Account Security: You are responsible for maintaining the confidentiality',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '98c002e6-7e29-4f71-baae-2c746a4d31ae',
          terms:
            'Vendor Obligations: 1. Service Quality: You commit to provide high-quality services in line with the standards set by CetizenCare. 2. Compliance: You agree to comply with all local, state, and federal laws and regulations applicable to your services.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'f15e3f82-85ae-4c0d-9d6a-b5e50e581ba7',
          terms:
            'Financial Terms: 1. Fees and Payments: Detailed information about service fees, payment schedules, and financial transactions will be governed as per the Vendor Financial Agreement. 2. Taxes: You are responsible for collecting and remitting any taxes associated with the services you provide.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6cd465e8-3e4f-45c3-9e86-12bc65fb3a36',
          terms:
            'Intellectual Property Rights: 1. Ownership: All intellectual property rights in the platform and its content belong to CetizenCare or its licensors. 2. License: CetizenCare grants you a limited, non-exclusive, non-transferable license to access and use the platform.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'd5917944-4d37-45b1-91b9-d09204745c4e',
          terms:
            'Prohibited Conduct You agree not to: 1. Engage in fraudulent, deceptive, or unethical business practices. 2. Infringe on the rights of others, including intellectual property rights. 3.Post or transmit any content that is illegal, offensive, or harmful.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '840176c4-03c2-4b7b-8bb2-ee3814a67b2a',
          terms:
            'Limitation of Liability: CetizenCare shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising out of or in connection with the platform.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '7f8e2c62-9fc1-41f7-b1c8-3e8a6f769536',
          terms:
            'Termination: We may terminate or suspend your access to the platform without prior notice or liability, for any reason, including breach of these Terms.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '94f50137-c3d9-4b1a-81e7-8d55c2a1a620',
          terms:
            'Governing Law: These Terms shall be governed and construed in accordance with the laws of US Government, without regard to its conflict of law principles.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '1af8f65c-77e1-4e87-97a5-4ec97bdfc177',
          terms:
            'Modifications to Terms: We reserve the right to modify these Terms at any time. We will provide notice of any significant changes.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'e55f85d7-98f2-4e32-aaeb-49db1b2a8e90',
          terms:
            'Contact Information: For any questions about these Terms, please contact us at support@cetizencare.com.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '41a7a57a-929a-4a9f-9f85-33bf36c8784f',
          terms:
            'Pre-Order Payment: The Customer shall pay a non-refundable pre-order fee of [$250.00] at the time of placing the pre-order. The remaining balance of [$750.00] shall be due upon the Products release.',
          Person: 'Vendor',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '56c492fc-18b5-46b8-8d61-d4abff181d6e',
          terms:
            'Introduction: Welcome to CetizenCare. By accessing our app and using our services, you agree to be bound by the following terms and conditions. Please read them carefully.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'd7a3387e-3f07-4b12-9e95-2ac823ceba43',
          terms:
            'User Eligibility: The services of CetizenCare are available only to individuals who can form legally binding contracts under applicable law. By using this app, you represent that you are of legal age to enter into a binding contract.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2a1e9b5c-1a1e-4e80-9c84-72c6c2f88f0b',
          terms:
            'Privacy Policy: Your privacy is important to us. Our Privacy Policy, which also governs your use of the app, explains how we collect, use, and disclose information about you.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3cfdbccf-3c19-4fe9-976e-99b8de2a6251',
          terms:
            'Account Registration: You may be required to create an account to access certain features or services. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'f3a3e505-18a1-4c6f-b0f3-cd41f6b07e74',
          terms:
            'Service Use: 1. Booking Services: You are responsible for all activities that occur under your account. 2. Payment: Payment for services booked via the app must be completed through the approved payment methods. 3.3 Cancellations and Refunds: Please refer to our Cancellation and Refund Policy for details on canceling bookings and requesting refunds.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '8e942784-8571-49b9-8e24-20a9540bfbf2',
          terms:
            'Prohibited Conduct: In using CetizenCare, you must not: 1. Engage in any illegal activities or violate any applicable laws. 2. Post or transmit any unlawful, threatening, abusive, libelous, defamatory, obscene, or indecent material. 3.Infringe the intellectual property rights of others.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3c29a2a8-2e14-4c8e-bc61-735398a11a69',
          terms:
            'Intellectual Property: All content included on the app, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the app, is the property of CetizenCare or its suppliers and protected by copyright and other laws.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '0c3d367a-03bb-4a63-80b2-e3f8c2d9714d',
          terms:
            'Limitation of Liability: CetizenCare will not be liable for any damages of any kind arising from the use of this app, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6ac43c50-3817-4817-b90d-0c75107a9680',
          terms:
            'Modifications to the App and Services: CetizenCare reserves the right at any time to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '9e1b9c9b-f7f2-46d3-b430-c5a34a1a1e99',
          terms:
            'Termination: We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '8a882b3f-697e-4c02-889b-759d67259711',
          terms:
            'Governing Law: These Terms shall be governed by and construed in accordance with the laws of US Government, without regard to its conflict of law provisions.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'd2d999e4-eb8c-40b3-91c6-1cf60ea0d87c',
          terms:
            ' Changes to Terms: We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '67e880e2-6f70-4e8d-aa4e-f71ee8a14ee4',
          terms:
            'Contact Us: If you have any questions about these Terms, please contact us at support@cetizencare.com.',
          Person: 'Customer',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('terms_conditions', null, {})
  }
}
