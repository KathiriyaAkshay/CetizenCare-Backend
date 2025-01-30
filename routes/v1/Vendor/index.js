// adminRoutes.js
const express = require('express')
const router = express.Router()

// Import the route modules from subdirectories
const vendorRoutes = require('./vendor.routes')
const couponsRoutes = require('./vendor.coupons.routes')
const profileRoutes = require('./vendor.profile.routes')
const orderRoutes = require('./vendor.order.routes')
const dashboardRoutes = require('./vendor.dashboard.routes')
const chatRoutes = require('./vendor.chat.routes')

// Use the route modules as middleware
router.use('/', vendorRoutes)
router.use('/coupons', couponsRoutes)
router.use('/profile', profileRoutes)
router.use('/order', orderRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/chat', chatRoutes)

module.exports = router
