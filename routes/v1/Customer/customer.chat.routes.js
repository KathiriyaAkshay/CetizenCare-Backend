const express = require('express')
const { body } = require('express-validator')
const authenticateCustomer = require('../../../middleware/authenticateCustomer')
const customerChatController = require('../../../controllers/Customer/customer.chat.controller')
const router = express.Router()

router.post('/chat-initiate', authenticateCustomer, customerChatController.createOrGetAOneOnOneChat)

router.get('/getAllChats', authenticateCustomer, customerChatController.getAllChats)
router.post(
  '/setUnread',
  authenticateCustomer,
  customerChatController.setUnread
)
router.get(
  '/getAllMessages/:room_id',
  authenticateCustomer,
  customerChatController.getAllMessages
)
router.post(
  '/sendMessage/:chatId',
  authenticateCustomer,
  customerChatController.sendMessage
)

router.post(
  '/deleteChatById/:chatId',
  authenticateCustomer,
  customerChatController.deleteChatById
)

router.post(
  '/deleteChats',
  authenticateCustomer,
  customerChatController.deleteChats
)

router.post(
  '/frontendEvent',
  authenticateCustomer,
  customerChatController.frontendEvent
)

router.post(
  '/getCoordinates',
  authenticateCustomer,
  customerChatController.getCoordinates
)

module.exports = router
