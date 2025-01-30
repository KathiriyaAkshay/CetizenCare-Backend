const express = require('express')
const adminCouponController = require('../../../controllers/Admin/admin.coupons.controller')
const { body } = require('express-validator')
const authenticateAdmin = require('../../../middleware/authenticateAdmin')
const router = express.Router()

router.post('/add', authenticateAdmin, adminCouponController.addOffer)
router.get('/get', authenticateAdmin, adminCouponController.getOffers)
router.patch(
  '/edit/:offerId',
  authenticateAdmin,
  adminCouponController.editOffer
)
router.patch(
  '/delete/:offerId',
  authenticateAdmin,
  adminCouponController.deleteOffer
)

router.get('/get/:offerId', authenticateAdmin, adminCouponController.getOfferById);

module.exports = router
