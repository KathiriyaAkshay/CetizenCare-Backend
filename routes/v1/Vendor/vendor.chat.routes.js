const express = require('express')
const { body } = require('express-validator')
const authenticateVendor = require('../../../middleware/authenticateVendor')
const vendorChatController = require('../../../controllers/Vendor/vednor.chat.controller')
const router = express.Router()

router.post(
  '/chat-initiate',
  authenticateVendor,
  vendorChatController.createOrGetAOneOnOneChat
)

router.get(
  '/getAllChats',
  authenticateVendor,
  vendorChatController.getAllChats
)
router.get(
  '/getAllMessages/:room_id',
  authenticateVendor,
  vendorChatController.getAllMessages
)
router.post(
  '/sendMessage/:chatId',
  authenticateVendor,
  vendorChatController.sendMessage
)

router.post('/setUnread', authenticateVendor, vendorChatController.setUnread)

router.post(
  '/deleteChatById/:chatId',
  authenticateVendor,
  vendorChatController.deleteChatById
)

router.post(
  '/deleteChats',
  authenticateVendor,
  vendorChatController.deleteChats
)

router.post('/frontendEvent', authenticateVendor, vendorChatController.frontendEvent)

module.exports = router