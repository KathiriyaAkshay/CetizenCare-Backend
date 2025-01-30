const express = require('express')
const customerBookingController = require('../../../controllers/Customer/customer.bookings.controller')
const customerReviewController = require('../../../controllers/Customer/customer.review_and_rating.controller')
const { body } = require('express-validator')
const authenticateCustomer = require('../../../middleware/authenticateCustomer')
const bodyParser = require('body-parser')
const router = express.Router()


router.get('/getCarts', authenticateCustomer, customerBookingController.getCarts);
router.patch(
  '/editCarts/:cartId',
  authenticateCustomer,
  customerBookingController.editCart
)
router.delete('/deleteCart/:cartId', authenticateCustomer, customerBookingController.deleteCart);
router.post('/checkout', authenticateCustomer, customerBookingController.checkout);
router.get(
  '/preCheckoutDetails/:id',
  authenticateCustomer,
  customerBookingController.preCheckoutDetail
)
router.post('/webhook', bodyParser.raw({ type: "application/json"}), customerBookingController.webhooks);
router.get('/success', customerBookingController.success);
router.get('/cancel', customerBookingController.cancel);
// router.get('/getAllBookings', authenticateCustomer, customerBookingController.getAllBookings);
router.post('/getCouponCode', authenticateCustomer, customerBookingController.getCouponCodes);
router.post('/checkoutStep1', authenticateCustomer, customerBookingController.checkoutStep1);
router.post('/cancelBooking', authenticateCustomer, customerBookingController.cancelBooking);

router.get('/getAllBookings', authenticateCustomer, customerBookingController.getAllBookings);
router.get('/getBookingById/:id', authenticateCustomer, customerBookingController.getBookingByID);
router.post('/onCancelPayment',  authenticateCustomer, customerBookingController.onCancelPayment)
router.post('/onRescheduleBooking', authenticateCustomer, customerBookingController.onRescheduleService)
router.get(
  '/getAdminCoupons',
  customerBookingController.getAdminCoupons
)
module.exports = router
