const db = require('../../models')
const chat_data = db.chat_data
const chat_room = db.chat_room
const Vendor = db.Vendor
const Customer = db.Customer
const cart = db.cart
const booking = db.booking
const SuperAdmin = db.SuperAdmin
const vendor_service = db.vendor_service
const sub_category = db.sub_category
const crypto = require('crypto')
const { emitSocketEvent, frontendEvent } = require('../../socket')

exports.createOrGetAOneOnOneChat = async (req, res, next) => {
  try {
    const { receiver_id, cart_id, receiver_type } = req.body

    let receiver
    if (receiver_type === 'Vendor') {
      receiver = await Vendor.findOne({
        where: {
          id: receiver_id
        }
      })
    } else if (receiver_type === 'Customer') {
      receiver = await Customer.findOne({
        where: {
          id: receiver_id
        }
      })
    } else {
      receiver = await SuperAdmin.findOne({
        where: {
          id: receiver_id
        }
      })
    }

    if (!receiver)
      return res
        .status(404)
        .json({ status: false, message: 'Receiver not found.' })

    if (receiver.id.toString() === req.user.id.toString()) {
      return res
        .status(400)
        .json({ status: false, message: "You can't chat with yourself" })
    }
    const combinedUUIDs = receiver_id + req.user.id + cart_id
    const uniqueId = crypto
      .createHash('md5')
      .update(combinedUUIDs)
      .digest('hex')
    // console.log(uniqueId, ' : uniqueId')
    const chat = await chat_room.findOne({
      where: {
        room_id: uniqueId
      }
    })

    if (chat) {
      //   const chatData = await chat_data.findAll({
      //     where: {
      //       room_id: uniqueId
      //     }
      //   })
      //   console.log(chatData, '!!!!!!!!!!!!!!!!!!!!!!!!!!')
      //   emitSocketEvent(req.io, uniqueId, 'message', chatData)

      return res.status(200).json({
        status: true,
        message: 'Successful',
        data: {
          room_id: uniqueId,
          isExist: true,
          user: {
            firstname: receiver?.firstname,
            profile_img: receiver?.profile_img
           }
        }
      })
    }

    const newChatInstance = await chat_room.build({
      room_id: uniqueId,
      created_at: Date.now(),
      customer_id: receiver_id,
      vendor_id: req.user.id,
      cart_id: cart_id,
      created_by: 'Vendor'
    })
    await newChatInstance.save()

    // const newUserDataInstance1 = await chat_userdata.build({
    //   chat_id: newChatInstance?.id,
    //   user_id: req?.user?.id,
    //   user: 'Customer'
    // })
    // const newUserDataInstance2 = await chat_userdata.build({
    //   chat_id: newChatInstance?.id,
    //   user_id: receiver_id,
    //   user: receiver_type
    // })

    // await newUserDataInstance1.save()
    // await newUserDataInstance2.save()

    emitSocketEvent(req.io, uniqueId, 'newChat', [{}])
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: {
        room_id: uniqueId,
        isExist: false,
        event: 'newChat',
        user: {
            firstname: receiver?.firstname,
            profile_img: receiver?.profile_img
           }
      }
    })
  } catch (err) {
    next(err)
  }
}

// exports.

exports.getAllChats = async (req, res, next) => {
  try {
    let chat_ids = await chat_room.findAll({
      where: {
        vendor_id: req.user.id,
        vendor_deleted: {
          [db.Sequelize.Op.eq]: false,
        },
      },
      attributes: ["room_id"],
    });

    chat_ids = chat_ids.map(item => {
      return item.room_id
    })
    if (chat_ids.length == 0) {
      return res
        .status(200)
        .json({ status: true, message: 'Successful', data: [] })
    }

    const receiver = await chat_room.findAll({
      where: {
        room_id: {
          [db.Sequelize.Op.in]: [...chat_ids]
        }
      },
      attributes: [
        'room_id'
      ],
      include: [
        {
          model: Customer,
          attributes: ['id', 'firstname', 'middlename', 'lastname', 'profile_img']
        },
        {
          model: chat_data,
          attributes: []
        },
         {
          model: cart,
          include: [
            {
              model: vendor_service,
              include: [
                {
                  model: sub_category,
                  attributes: ["name"],
                },
              ],
              attributes: ['subcategory']
            },
          ],
          attributes: ['service'],
        },
      ],
      group: ['chat_room.room_id', 'Customer.id', 'chat_data.id', 'cart->vendor_service.id', 'cart->vendor_service->sub_category.id', 'cart.id']
    })

    const unreadCounts = await db.chat_room.findAll({
            where: {
                vendor_id: req.user.id
            },
            attributes: [
                'room_id',
                [
                    db.sequelize.fn('COUNT', db.sequelize.literal('CASE WHEN "chat_data"."send_from" = \'Customer\' AND "chat_data"."unread" = true THEN 1 END')),
                    'unread_count'
                ]
            ],
            include: [
                {
                    model: db.chat_data,
                    attributes: []
                }
            ],
            group: ['chat_room.room_id']
        });

    const res1 = receiver.map((item) => {
        const count = unreadCounts.find((e)=>e.room_id === item.room_id)
        let record = {
            room_id: item?.room_id,
            unread_count: count?.dataValues?.unread_count,
            Customer: item?.Customer,
            cart: item?.cart
        }
        
        return record
    })

    const chats = await db.sequelize.query(
      `
  SELECT DISTINCT ON ("room") 
    "room",
    "content",
     "updatedAt" as "time"
  FROM "chat_data"
  WHERE "room" IN (:chatIds)
  ORDER BY "room", "createdAt" DESC
`,
      {
        replacements: { chatIds: chat_ids },
        type: db.sequelize.QueryTypes.SELECT
      }
    )

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { receiver: res1, last_message: chats }
    })
  } catch (err) {
    next(err)
  }
}

exports.getAllMessages = async (req, res, next) => {
  try {
    const { room_id } = req.params
    const selectedChat = await chat_room.findOne({
      where: {
        room_id: room_id
      },
      include: [
       {
          model: Customer,
          attributes: ['id', 'firstname', 'middlename', 'lastname', 'profile_img']
        },
        {
          model: Vendor,
          attributes: ['id', 'firstname', 'middlename', 'lastname', 'profile_img']
        },
        {
          model: cart,
          include: [
            {
              model: vendor_service,
              include: [
                {
                  model: sub_category,
                  attributes: ["name"],
                },
              ],
              attributes: ['subcategory']
            },
          ],
          attributes: ['service'],
        },
      ]
    })

    if (!selectedChat) {
      return res
        .status(404)
        .json({ status: false, message: 'Chat does not exist' })
    }

    if (selectedChat.vendor_id !== req.user.id) {
      return res
        .status(400)
        .json({ status: false, message: 'User is not part of this chat' })
    }

    const status = await cart.findOne({
        where: {
            id: selectedChat?.cart_id
        },
        include: [
            {
                model: booking,
                attributes: ['status']
            }
        ]
    })

    const messages = await chat_data.findAll({
      where: {
        room: room_id
      }
    })

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { messages: messages, status: status?.booking?.status, service_name: selectedChat?.cart?.vendor_service?.sub_category?.name, customer: selectedChat?.Customer }
    })
  } catch (err) {
    next(err)
  }
}

exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { content, is_quoted, quoted_message } = req.body

    if (!content) {
      return res
        .status(400)
        .json({ status: false, message: 'Content is required' })
    }

    const selectedChat = await chat_room.findOne({
      where: {
        room_id: chatId
      }
    })

    if (!selectedChat) {
      return res
        .status(400)
        .json({ status: false, message: 'Chat does not exist' })
    }

    const message = await chat_data.build({
      send_from: 'Vendor',
      content: content,
      time_stamp: Date.now(),
      send_from_customer: selectedChat.customer_id,
      send_from_vendor: req.user.id,
      chat_timestamp: Date.now(),
      room: chatId
    })
    if (is_quoted) {
      message.is_quoted = true
      message.quoted_message = quoted_message
    }

    await message.save()

    emitSocketEvent(req.io, chatId, 'messageReceived', message)
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.setUnread = async (req, res, next) => {
  try {
    const { room_id } = req.body
    const data = await chat_data.update(
      { unread: false },
      {
        where: {
          room: room_id,
          unread: true
        }
      }
    )

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteChatById = async (req, res, next) => {
  try {
    const chatId = req.params.chatId
    const delete_chat = await chat_room.findOne({
      where: {
        room_id: chatId,
        vendor_id: req.user.id
      }
    })
    if (!delete_chat) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong' })
    }
    delete_chat.vendor_deleted = true
    await delete_chat.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteChats = async (req, res, next) => {
  try {
    const ids = req.body
    const result = await chat_room.update(
      { vendor_deleted: true },
      {
        where: {
          room_id: {
            [db.Sequelize.Op.in]: [...ids?.chat_ids]
          },
          vendor_id: req.user.id
        }
      }
    )
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.frontendEvent = async (req, res, next) => {
  try {

    const { latitude, longitude, eventName } = req.body

    await cart.update({
      latitude: latitude,
      longitude: longitude
    }, {
      where: {
        id: eventName
      }
    })

    frontendEvent(
      req.io,
      {
        latitude,
        longitude
      },
      eventName
    )

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}
