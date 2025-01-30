const express = require('express');
const vendorController = require("../../../controllers/Vendor/vendor.controller");
const { body } = require('express-validator');
const authenticateVendor = require('../../../middleware/authenticateVendor');
const router = express.Router();

router.post('/registerStep0', vendorController.registerStep0);

router.post('/registerStep1', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.'),
    body('password').trim().isLength({ min: 3 }),
    body('firstname').trim().not().isEmpty()
], vendorController.registerStep1);

// router.get('/getMobileVerificationCode', vendorController.getMobileVerificationCode);
// router.post('/setMobileVerificationTrue', vendorController.setMobileVerificationTrue);
router.post('/resendOtpToMobile', vendorController.resendOtpToMobile);
router.post('/emailVerificationOtp', vendorController.emailVerificationOtp);

router.post('/verifyMobileNumber', vendorController.verifyMobileNumber);
router.post('/verifyEmail', vendorController.verifyEmail);


router.post('/registerStep2', vendorController.registerStep2);
router.post('/registerStep3', vendorController.registerStep3);
router.post('/registerStep03', vendorController.registerStep03)
router.post('/registerStep4', vendorController.registerStep4);

router.post('/loginWithEmail', vendorController.loginWithEmail);
router.post('/loginEmailVerify', vendorController.loginEmailVerify);
router.post('/loginWithMobile', vendorController.loginWithMobile);
router.post('/loginMobileVerify', vendorController.loginMobileVerify);

router.post('/logout',authenticateVendor, vendorController.logout);

router.post('/forgotOrResetPasswordWithEmail', vendorController.forgotPasswordWithEmail);
router.post('/forgotOrResetPasswordWithMobile', vendorController.forgotPasswordWithMobileNumber);
router.post(
  '/forgotPasswordWithSecurityQnA',
  vendorController.forgotPasswordWithSecurityQnA
)
router.post('/resetPassword', vendorController.resetPassword);
router.get("/getSecurityQnA", vendorController.getSecurityQnA);
router.get("/getCriminalQnA", vendorController.getCriminalRecordQnA);
router.post('/verifySecurityQnA', vendorController.verifySecurityQnA);

//Service api's
router.post("/addService",authenticateVendor, vendorController.addService);
router.get("/getAllService", authenticateVendor, vendorController.getAllService);
router.get('/getServiceById/:serviceId', vendorController.getServiceById);
router.patch('/editService/:serviceId', authenticateVendor, vendorController.editService);
router.patch(
  '/deleteService/:serviceId',
  authenticateVendor,
  vendorController.deleteService
)

router.get('/getVendorServices', authenticateVendor, vendorController.getVendorServices)
//Document getter
// router.get("/getDLFront",authenticateVendor, vendorController.getDLFront);
// router.get('/getDLBack', authenticateVendor, vendorController.getDLBack);
// router.get("/getSSNImage", authenticateVendor, vendorController.getSSNImage);
// router.get("/getSLIImage", authenticateVendor, vendorController.getSLIImage);

router.post("/addAddress", authenticateVendor, vendorController.createAddress);
router.get("/getAllAddress", authenticateVendor, vendorController.getAllAddress);
router.get("/getAddressById/:addressId", authenticateVendor, vendorController.getAddressById);
router.patch("/editAddress/:addressId", authenticateVendor, vendorController.editAddress);
router.delete("/deleteAddress/:addressId", authenticateVendor, vendorController.deleteAddress);

router.get('/getAllReview', authenticateVendor, vendorController.getAllReviews)

router.get(
  '/getAllCategories',
  vendorController.getAllCategory
)

router.get(
  '/getAllSubCategories',
  authenticateVendor,
  vendorController.getAllSubCategory
)
router.get(
  '/getAllSubCategoryByCategory/:categoryId',
  vendorController.getAllSubCategoryByCategory
)

router.get("/getCategory/:categoryId", authenticateVendor, vendorController.getCategory);

router.get('/vendorDetails', authenticateVendor, vendorController.vendorDetails);


// setting apis
router.post(
  '/editNotificationSettings',
  authenticateVendor,
  vendorController.editNotificationSettings
)
router.get(
  '/showNotificationSettings',
  authenticateVendor,
  vendorController.showNotificationSettings
)
router.get('/showTermsAndCondition', vendorController.showTermsAndCondition)
router.get('/bankAccountDetails', authenticateVendor, vendorController.bankAccountDetails)
router.post(
  '/updateBankAccountDetails',
  authenticateVendor,
  vendorController.updateAccountDetails
)

router.post(
  '/addBankAccount',
  authenticateVendor,
  vendorController.addAccount
)

module.exports = router;