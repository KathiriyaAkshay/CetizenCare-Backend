const express = require('express');
const authenticateCustomer = require('../../../middleware/authenticateCustomer');
const customerProfileController = require('../../../controllers/Customer/customer.profile.controller');
const customerPaymentsController = require('../../../controllers/Customer/customer.payments.controller');
const customerRatingAndReviewController = require('../../../controllers/Customer/customer.review_and_rating.controller')
const customerBookingController = require('../../../controllers/Customer/customer.bookings.controller')
const router = express.Router();


router.get('/', authenticateCustomer, customerProfileController.getProfile);
router.patch('/edit', authenticateCustomer, customerProfileController.editProfile);
router.patch('/sendOtpToMobile', authenticateCustomer, customerProfileController.sendOtpToMobile);
router.patch('/verifyMobileNumberForReset', authenticateCustomer, customerProfileController.verifyMobileNumberForReset)
router.patch(
  '/verifyEmailNumberForReset',
  authenticateCustomer,
  customerProfileController.verifyEmailNumberForReset
)
router.patch('/sendOtpToEmail', authenticateCustomer, customerProfileController.sendOtpToEmail);
router.patch('/updatePassword', authenticateCustomer, customerProfileController.updatePassword);
router.get('/getAllPayments', authenticateCustomer, customerPaymentsController.getAllPayments);
router.post(
  '/addReview',
  authenticateCustomer,
  customerRatingAndReviewController.addReview
)
router.get(
  '/getMyReviews',
  authenticateCustomer,
  customerRatingAndReviewController.getMyReviews
)

router.get('/getReviewById', authenticateCustomer, customerRatingAndReviewController.getReviewById)
router.post(
  '/editReview',
  authenticateCustomer,
  customerRatingAndReviewController.editReview
)

router.get('/pendingServiceReason', authenticateCustomer, customerBookingController.pendingServiceReason)

router.get('/getNotification', authenticateCustomer, customerProfileController.getNotification)
router.get('/getNotificationCount', authenticateCustomer, customerProfileController.getNotificationAndCartCount)
router.get(
  '/getNotificationById/:notificationId',
  authenticateCustomer,
  customerProfileController.getNotificationById
)
router.post(
  '/deleteNotificationById/:notificationId',
  authenticateCustomer,
  customerProfileController.deleteNotification
)

router.post(
  '/setReadAllNotification',
  authenticateCustomer,
  customerProfileController.allNotificationToRead
)


router.post(
  '/deleteAllNotification',
  authenticateCustomer,
  customerProfileController.deleteAllNotification
)
router.post(
  '/deleteAccount',
 authenticateCustomer, customerProfileController.deleteAccount
)

router.post(
  '/generateTimeSlots',
  customerProfileController.generateTimeSlot
)

router.get('/getCoupons', authenticateCustomer, customerRatingAndReviewController.getCoupons);
router.get(
  '/getCouponByCode/:code',
  authenticateCustomer,
  customerRatingAndReviewController.getCouponByCode
)


module.exports = router;