const express = require('express')
const vendorOrderController = require('../../../controllers/Vendor/vendor.order.controller')
const authenticateVendor = require('../../../middleware/authenticateVendor')
const router = express.Router()

router.get('/getPendingBookings', authenticateVendor, vendorOrderController.getPendingBookings);
router.get(
  '/getPastBookings',
  authenticateVendor,
  vendorOrderController.getPastBookings
)
router.get(
  '/getBookingById/:cartId',
  authenticateVendor,
  vendorOrderController.getBookingById
)
router.patch('/onRejectedOrder/:cartId', authenticateVendor, vendorOrderController.onRejectedOrder);
router.patch(
  '/onAcceptOrder/:cartId',
  authenticateVendor,
  vendorOrderController.onAcceptOrder
)

router.patch(
  '/onSuccessService/:cartId',
  authenticateVendor,
  vendorOrderController.onSuccessService
)

router.patch(
  '/onCancelOrder',
  authenticateVendor,
  vendorOrderController.onCancelOrder
)

router.get('/getLocationData/:cartId', authenticateVendor, vendorOrderController.getLocationData)

router.post('/startServicePath/:id', authenticateVendor, vendorOrderController.startServicePath)
router.post(
  '/cancelServicePath/:id',
  authenticateVendor,
  vendorOrderController.cancelServicePath
)

router.post(
  '/completeServicePath/:id',
  authenticateVendor,
  vendorOrderController.completeServicePath
)


module.exports = router