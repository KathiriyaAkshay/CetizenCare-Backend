const express = require('express')
const superAdminController = require('../../../controllers/Admin/superadmin.controller')
const { body } = require('express-validator')
const authenticateAdmin = require('../../../middleware/authenticateAdmin')
const router = express.Router()


module.exports = router
