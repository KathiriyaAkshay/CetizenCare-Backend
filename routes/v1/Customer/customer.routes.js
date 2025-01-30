const express = require('express');
const customerController = require('../../../controllers/Customer/customer.controller');
const { body } = require('express-validator');
const authenticateCustomer = require('../../../middleware/authenticateCustomer');
const router = express.Router();

// Register Routes
router.post('/registerStep1', customerController.registerStep1);
router.post('/resendOtpToMobile', customerController.resendOtpToMobile);
router.post('/emailVerificationOtp', customerController.emailVerificationOtp);
router.post('/verifyMobileNumber', customerController.verifyMobileNumber);
router.post('/verifyEmail', customerController.verifyEmail);
router.post('/registerStep2', customerController.registerStep2);
router.post('/registerStep3', customerController.registerStep3);


//Login Routes
router.post('/loginWithEmail', customerController.loginWithEmail);
router.post('/loginEmailVerify', customerController.loginEmailVerify);
router.post('/loginWithMobileNumber', customerController.loginWithMobile);
router.post('/loginMobileVerify', customerController.loginMobileVerify);

// Logout 
router.post('/logout', authenticateCustomer, customerController.logout)

//Forgot Password routes
router.post(
  '/forgotOrResetPasswordWithEmail',
  customerController.forgotPasswordWithEmail
);
router.post(
  '/forgotOrResetPasswordWithMobile',
  customerController.forgotPasswordWithMobileNumber
)
router.post('/forgotPasswordWithSecurityQnA', customerController.forgotPasswordWithSecurityQnA);
router.post(
  '/verifySecurityQnA',
  customerController.verifySecurityQnA
)

router.post('/resetPassword', customerController.resetPassword);

router.get('/getBookings', authenticateCustomer, customerController.getBookings);


router.post('/addAddress', authenticateCustomer, customerController.createAddress);
router.patch('/editAddress/:addressId', authenticateCustomer, customerController.editAddress);
router.get('/getAllAddress', authenticateCustomer, customerController.getAllAddress);
router.get('/getAddressById/:addressId', authenticateCustomer, customerController.getAddressById);
router.delete('/deleteAddress/:addressId', authenticateCustomer, customerController.deleteAddress);


router.get(
  '/getAllCategories',
  customerController.getAllCategory
)

router.get(
  '/getAllSubCategoryByCategory/:categoryId',
  customerController.getAllSubCategoryByCategory
)

router.get(
  '/getAllSubCategories',
  authenticateCustomer,
  customerController.getAllSubCategory
)

// router.get(
//   '/getCategory/:categoryId',
//   authenticateCustomer,
//   customerController.getCategory
// )
router.get(
  '/filterOnCategory',
  authenticateCustomer,
  customerController.filterOnCategory
)

router.get('/filterAllServices',authenticateCustomer, customerController.filterAllServices);

router.get('/getProfessionalByService', customerController.professionalByFilter);
router.get('/getVendorById', customerController.getVendorById);
router.get(
  '/getServiceById',
  customerController.getServiceById
)
router.get('/getTimeSlot/:serviceId',authenticateCustomer, customerController.getTimeSlot);
router.get('/getAllTimeSlot/',authenticateCustomer, customerController.getAllTimeSlot);
router.get(
  '/getBlockedTimeSlot/',
  authenticateCustomer,
  customerController.getBlockedTimeSlot
)
router.get(
  '/getTimeSlotForService',
  authenticateCustomer,
  customerController.getTimeSlotForService
)

router.post('/addTimeSlotToCart',authenticateCustomer, customerController.addTimeSlotToCart);
router.get('/relatedService',authenticateCustomer, customerController.relatedService);
// router.get('/relatedServices', authenticateCustomer, customerController.relatedServices)
router.get(
  '/topRattedService',
  customerController.topRattedService
)
router.get('/customerDetails', authenticateCustomer, customerController.customerDetails)

router.post(
  '/editNotificationSettings',
  authenticateCustomer,
  customerController.editNotificationSettings
)
router.get(
  '/showNotificationSettings',
  authenticateCustomer,
  customerController.showNotificationSettings
)
router.get('/showTermsAndCondition', customerController.showTermsAndCondition)

module.exports = router;