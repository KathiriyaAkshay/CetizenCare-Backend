const jwt = require('jsonwebtoken')
const db = require('../models')
const Customer = db.Customer
const blacklisted_token = db.blacklisted_token

async function authenticateCustomer (req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: 'Unauthorized User' }) // Unauthorized
  }

  try {
    const isBlacklisted = await blacklisted_token.findOne({ where: { token: token } })

    if (isBlacklisted) {
      return res
        .status(401)
        .json({status: false,  message: 'Token is blacklisted or revoked' })
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET)
    const user = await Customer.findOne({ where: { id: decoded.userId } })

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: 'Customer not found' }) // User not found
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(500).json({ status: false, message: error })
  }
}

module.exports = authenticateCustomer
