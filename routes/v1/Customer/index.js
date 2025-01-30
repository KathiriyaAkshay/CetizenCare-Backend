// adminRoutes.js
const express = require('express')
const router = express.Router()

// Import the route modules from subdirectories
const customerRoutes = require('./customer.routes')
const customerBookingRoutes = require('./customer.bookings.routes');
const customerProfile = require('./customer.profile.routes')
const customerChatRoutes = require('./customer.chat.routes')

// Use the route modules as middleware
router.use('/', customerRoutes);
router.use('/bookings', customerBookingRoutes)
router.use('/profile', customerProfile)
router.use('/chat', customerChatRoutes)

module.exports = router
