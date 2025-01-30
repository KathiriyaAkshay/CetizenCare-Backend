const express = require('express')
const vendorCouponController = require('../../../controllers/Vendor/vendor.coupons.controller')
const { body } = require('express-validator')
const authenticateVendor = require('../../../middleware/authenticateVendor')
const router = express.Router()

router.post('/add', authenticateVendor, vendorCouponController.addOffer);
router.get('/get', authenticateVendor, vendorCouponController.getOffers);
router.patch('/edit/:offerId', authenticateVendor, vendorCouponController.editOffer);
router.delete('/delete/:offerId', authenticateVendor, vendorCouponController.deleteOffer);
router.get('/get/:offerId', authenticateVendor, vendorCouponController.getOfferById);

module.exports = router

