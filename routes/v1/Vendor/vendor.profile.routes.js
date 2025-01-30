const express = require('express')
const authenticateVendor = require('../../../middleware/authenticateVendor')
const vendorProfileController = require('../../../controllers/Vendor/vendor.profile.controller')
const vendorRatingController = require('../../../controllers/Vendor/vendor.review_and_rating.controller')
const router = express.Router()

router.get('/', authenticateVendor, vendorProfileController.getProfile)
router.patch(
  '/edit',
  authenticateVendor,
  vendorProfileController.editProfile
)
router.patch(
  '/sendOtpToMobile',
  authenticateVendor,
  vendorProfileController.sendOtpToMobile
)
router.patch(
  '/verifyMobileNumberForReset',
  authenticateVendor,
  vendorProfileController.verifyMobileNumberForReset
)

router.patch(
  '/verifyEmailNumberForReset',
  authenticateVendor,
  vendorProfileController.verifyEmailNumberForReset
)


router.patch(
  '/sendOtpToEmail',
  authenticateVendor,
  vendorProfileController.sendOtpToEmail
)
router.patch(
  '/updatePassword',
  authenticateVendor,
  vendorProfileController.updatePassword
)

router.get('/getAllReviews', authenticateVendor, vendorRatingController.getAllReviews)

router.get(
  '/getNotification',
  authenticateVendor,
  vendorProfileController.getNotification
)
router.get(
  '/getNotificationAndCartCount',
  authenticateVendor,
  vendorProfileController.getNotificationAndCartCount
)

router.get(
  '/getNotificationById/:notificationId',
  authenticateVendor,
  vendorProfileController.getNotificationById
)
router.post(
  '/deleteNotificationById/:notificationId',
  authenticateVendor,
  vendorProfileController.deleteNotification
)

router.post(
  '/setReadAllNotification',
  authenticateVendor,
  vendorProfileController.allNotificationToRead
)


router.post(
  '/deleteAllNotification',
  authenticateVendor,
  vendorProfileController.deleteAllNotification
)

router.post(
  '/deleteAccount',
  authenticateVendor,
  vendorProfileController.deleteAccount
)



module.exports = router
