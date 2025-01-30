const express = require('express')
const dashboardController = require('../../../controllers/Vendor/vendor.dashboard.controller')
const { body } = require('express-validator')
const authenticateVendor = require('../../../middleware/authenticateVendor')
const router = express.Router()


router.get('/fourServiceApi', authenticateVendor, dashboardController.superApi)

router.get(
  '/getAverageRating',
  authenticateVendor,
  dashboardController.averageRating
)

router.get(
    '/getSuccessfulServiceCount',
    authenticateVendor,
    dashboardController.completedService
)

router.get('/totalEarning',
authenticateVendor,
dashboardController.totalEarning)

router.get('/totalFeedback', authenticateVendor, dashboardController.totalFeedback)

router.get('/recentOrders', authenticateVendor, dashboardController.recentOrder)
router.get('/serviceChart', authenticateVendor, dashboardController.serviceChart)
router.post('/calenderData', authenticateVendor, dashboardController.calenderData)
router.post('/getDataOnDate', authenticateVendor, dashboardController.getDataOnDate)
router.get('/payHistory', authenticateVendor, dashboardController.payHistory)
// router.post('/addCompletionTime', authenticateVendor, dashboardController.addCompletionTime);

module.exports = router
