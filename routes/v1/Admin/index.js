// adminRoutes.js
const express = require('express')
const router = express.Router()

// Import the route modules from subdirectories
const adminRoutes = require('./superadmin.routes')
const couponsRoutes = require('./admin.coupons.routes')
// const categoriesRoutes = require('./admin.categories.routes')

// Use the route modules as middleware
router.use('/', adminRoutes)
// router.use('/categories', categoriesRoutes);
router.use('/coupons', couponsRoutes)

module.exports = router
