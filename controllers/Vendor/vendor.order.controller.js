const db = require('../../models')
require('dotenv').config()
const Sequelize = db.Sequelize
const cart = db.cart
const Customer = db.Customer
const vendor_service = db.vendor_service
const sub_category = db.sub_category
const booking = db.booking
const customer_address = db.customer_address
const booking_address = db.booking_address
const vendor_service_review = db.vendor_service_review
const payment_details = db.payment_details
const notification = db.notification
const refund_details = db.refund_details
const calendar_booking_data = db.calendar_booking_data
const Stripe = require('stripe')
const { sendMobileVerificationCode } = require('../../services/mobileService/mobileService')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const Vendor = db.Vendor

function formatDateToYYYYMMDD (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Adding 1 because months are zero-based
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

exports.getPendingBookings = async (req, res, next) => {
  try {
    const id = req.user.id
    const bookings = await cart.findAll({
      where: {
        vendor: id,
        deleted: {
          [db.Sequelize.Op.not]: true
        },
        [db.Sequelize.Op.or]: [
          {
            booking_id: {
              [db.Sequelize.Op.not]: null
            }
          },
          {
            status: 'Pending'
          }
        ]
      },
      attributes: [
        'id',
        'date',
        'time',
        'status',
        'booking_id',
        'quantity',
        'price',
        'orderId'
      ],
      include: [
        {
          model: Customer,
          as: 'cart_customer',
          attributes: [
            'firstname',
            'middlename',
            'lastname',
            'id',
            'profile_img',
            'customerId'
          ]
          //   include: [
          //     {
          //       model: customer_address,
          //       as: 'customer_address',
          //       attributes: ['address1', 'address12', 'city', 'state', 'pincode']
          //     }
          //   ]
        },
        {
          model: vendor_service,
          attributes: ['subcategory', 'service_location'],
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        },
        {
          model: booking
          //   attributes: ['status']
        },
        {
          model: booking_address,
          attributes: [
            'address1',
            'address2',
            'city',
            'state',
            'pincode',
            'addressName',
            'latitude',
            'longitude'
          ]
        }
      ],
      order: ['createdAt', 'DESC']
    })

    if (!bookings) {
      return res.status(404).json({
        status: false,
        message: 'No Bookings are Pending'
      })
    }

    const firstHalf = bookings.filter(item => item.status === 'Pending')

    let SecondHalf = bookings.filter(
      item =>
        item.status !== 'Pending' &&
        item.booking_id !== null &&
        item.status !== 'Rejected' &&
        item?.booking?.status !== 'Successful'
    )
    let ids
    if (SecondHalf?.length > 0) {
      ids = SecondHalf.map(item => item.booking_id)
    } else {
      ids = []
    }

    let booking_detail
    if (ids?.length > 0) {
      booking_detail = await booking.findAll({
        where: {
          id: {
            [db.Sequelize.Op.in]: ids
          },
          status: 'Reschedule'
        },
        attributes: ['id']
      })
    }

    if (booking_detail?.length > 0) {
      ids = booking_detail.map(item => item.id)
      SecondHalf = SecondHalf.filter(item => ids.includes(item.booking_id))
    }
    let data = []
    if (firstHalf?.length > 0) {
      data = firstHalf.map(tuple => {
        // console.log(tuple.booking_address)
        return {
          cart_id: tuple.id,
          date: tuple.date != null ? formatDateToYYYYMMDD(tuple.date) : null,
          time: tuple.time,
          reschedule_count: tuple?.booking?.reschedule_count,
          previous_reschedule_time: tuple?.previous_reschedule_time,
          previous_reschedule_date:
            tuple?.previous_reschedule_date != null
              ? formatDateToYYYYMMDD(tuple?.previous_reschedule_date)
              : null,
          price: tuple.price,
          quantity: tuple.quantity,
          firstname: tuple.cart_customer.firstname,
          middlename: tuple.cart_customer.middlename,
          lastname: tuple.cart_customer.lastname,
          customerId: tuple.cart_customer.customerId,
          customer_profile: tuple.cart_customer.profile_img,
          service_name: tuple.vendor_service.sub_category.name,
          cart_status: tuple.status,
          booking_status: '',
          orderId: tuple.orderId,
          //   customer_address: tuple.cart_customer.customer_address,
          service_location: tuple.vendor_service.service_location,
          address: tuple.booking_address
        }
      })
    }

    if (SecondHalf?.length > 0) {
      let sdata = SecondHalf.map(tuple => {
        return {
          cart_id: tuple.id,
          date: tuple.date != null ? formatDateToYYYYMMDD(tuple.date) : null,
          time: tuple.time,
          reschedule_count: tuple?.booking?.reschedule_count,
          previous_reschedule_time: tuple?.previous_reschedule_time,
          previous_reschedule_date:
            tuple?.previous_reschedule_date != null
              ? formatDateToYYYYMMDD(tuple?.previous_reschedule_date)
              : null,
          price: tuple.price,
          quantity: tuple.quantity,
          firstname: tuple.cart_customer.firstname,
          middlename: tuple.cart_customer.middlename,
          lastname: tuple.cart_customer.lastname,
          customerId: tuple.cart_customer.customerId,
          customer_profile: tuple.cart_customer.profile_img,
          service_name: tuple.vendor_service.sub_category.name,
          cart_status: tuple.status,
          booking_status: 'Reschedule',
          orderId: tuple.orderId,
          //   customer_address: tuple.cart_customer.customer_address,
          service_location: tuple.vendor_service.service_location,
          address: tuple.booking_address
        }
      })
      data = [...data, ...sdata]
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: data
    })
  } catch (err) {
    next(err)
  }
}

exports.getPastBookings = async (req, res, next) => {
  try {
    const id = req.user.id
    const bookings = await cart.findAll({
      where: {
        vendor: id,
        [db.Sequelize.Op.or]: [
          {
            booking_id: {
              [db.Sequelize.Op.not]: null
            }
          },
          {
            status: {
              [db.Sequelize.Op.not]: 'Pending'
            }
          }
        ]
      },
      attributes: [
        'id',
        'date',
        'time',
        'status',
        'booking_id',
        'orderId',
        'rejected_reason',
        'rejected_date'
      ],
      include: [
        {
          model: Customer,
          as: 'cart_customer',
          attributes: [
            'firstname',
            'middlename',
            'lastname',
            'id',
            'profile_img',
            'customerId'
          ]
        },
        {
          model: vendor_service,
          attributes: ['subcategory', 'id'],
          include: [
            {
              model: sub_category,
              attributes: ['name']
            },
            {
              model: vendor_service_review,
              attributes: [
                'id',
                'service',
                'rating',
                'comment',
                'time',
                'images'
              ]
            }
          ]
        },
        {
          model: booking,
          attributes: ['status'],
          include: [
            {
              model: payment_details,
              attributes: ['id', 'status']
            }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    })

    if (!bookings) {
      return res.status(404).json({
        status: false,
        message: 'No Bookings are Pending'
      })
    }

    const firstHalf = bookings.filter(item => item.status === 'Rejected')

    // console.log(firstHalf)
    let SecondHalf = bookings.filter(
      item => item.booking_id !== null && item.status === 'Approved'
    )

    let ids
    if (SecondHalf.length > 0) {
      ids = SecondHalf.map(item => item.booking_id)
    } else {
      ids = []
    }

    let booking_detail
    if (ids.length > 0) {
      booking_detail = await cart.findAll({
        where: {
          booking_id: {
            [db.Sequelize.Op.in]: ids
          }
        },
        attributes: [
          'id',
          'date',
          'time',
          'status',
          'booking_id',
          'orderId',
          'rejected_reason',
          'rejected_date'
        ],
        include: [
          {
            model: Customer,
            as: 'cart_customer',
            attributes: [
              'firstname',
              'middlename',
              'lastname',
              'id',
              'profile_img',
              'customerId'
            ]
          },
          {
            model: vendor_service,
            attributes: ['subcategory', 'id'],
            include: [
              {
                model: sub_category,
                attributes: ['name']
              },
              {
                model: vendor_service_review,
                attributes: [
                  [
                    Sequelize.literal(`(
                SELECT ROUND(CAST(AVG(rating) AS numeric), 1)
                FROM vendor_service_reviews
                WHERE vendor_service_reviews.service = "vendor_service"."id"
              )`),
                    'average_rating'
                  ],
                  [
                    Sequelize.literal(`(
                SELECT COUNT(id)
                FROM vendor_service_reviews
                WHERE vendor_service_reviews.service = "vendor_service"."id"
              )`),
                    'review_count'
                  ]
                ]
              }
            ]
          },
          {
            model: booking,
            attributes: [
              'id',
              'status',
              'cancel_reason',
              'cancel_date',
              'vendor_cancel_reason',
              'vendor_cancel_date'
            ],
            include: [
              {
                model: payment_details,
                attributes: ['id', 'status']
              }
            ]
          }
        ]
      })
    }

    if (booking_detail) {
      SecondHalf = booking_detail.filter(item => {
        if (
          item.booking.status === 'Successful' ||
          item.booking.status === 'Cancelled' ||
          item.booking.status === 'Vendor_Cancel'
        ) {
          return item
        }
      })
    } else {
      SecondHalf = []
    }
    // SecondHalf = SecondHalf.filter(item => ids.includes(item.booking_id))

    let data1 = []
    if (firstHalf?.length > 0) {
      data1 = firstHalf.map(tuple => {
        return {
          cart_id: tuple.id,
          date: tuple.date != null ? formatDateToYYYYMMDD(tuple.date) : null,
          time: tuple.time,
          firstname: tuple.cart_customer.firstname,
          middlename: tuple.cart_customer.middlename,
          lastname: tuple.cart_customer.lastname,
          customer_id: tuple.cart_customer.customerId,
          customer_profile: tuple.cart_customer.profile_img,
          service_name: tuple.vendor_service.sub_category.name,
          cart_status: tuple.status,
          orderId: tuple.orderId,
          rejected_reason: tuple?.rejected_reason,
          rejected_date: tuple?.rejected_date,
          cancel_reason: tuple?.booking?.cancel_reason,
          cancel_date: tuple?.booking?.cancel_date,
          vendor_cancel_date: tuple?.booking?.vendor_cancel_date,
          vendor_cancel_reason: tuple?.booking?.vendor_cancel_reason,
          rating:
            tuple.vendor_service?.vendor_service_reviews[0]?.dataValues
              .average_rating ?? 0,
          reviews:
            tuple.vendor_service?.vendor_service_reviews[0]?.dataValues
              .review_count ?? 0,
          payment_status: tuple?.booking?.payment_detail?.status
        }
      })
    }

    let data2 = []
    if (SecondHalf?.length !== 0) {
      data2 = SecondHalf.map(tuple => {
        return {
          cart_id: tuple.id,
          date: tuple.date != null ? formatDateToYYYYMMDD(tuple.date) : null,
          time: tuple.time,
          firstname: tuple.cart_customer.firstname,
          middlename: tuple.cart_customer.middlename,
          lastname: tuple.cart_customer.lastname,
          customer_id: tuple.cart_customer.customerId,
          customer_profile: tuple.cart_customer.profile_img,
          service_name: tuple.vendor_service.sub_category.name,
          cart_status: tuple.status,
          booking_status: tuple.booking.status,
          orderId: tuple.orderId,
          rejected_reason: tuple?.rejected_reason,
          rejected_date: tuple?.rejected_date,
          cancel_reason: tuple?.booking?.cancel_reason,
          cancel_date: tuple?.booking?.cancel_date,
          vendor_cancel_date: tuple?.booking?.vendor_cancel_date,
          vendor_cancel_reason: tuple?.booking?.vendor_cancel_reason,
          rating:
            tuple.vendor_service?.vendor_service_reviews[0]?.dataValues
              .average_rating ?? 0,
          reviews:
            tuple.vendor_service?.vendor_service_reviews[0]?.dataValues
              .review_count ?? 0,
          payment_status: tuple?.booking?.payment_detail?.status
        }
      })
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: [...data1, ...data2]
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.getBookingById = async (req, res, next) => {
  try {
    const id = req.params.cartId
    const bookings = await cart.findOne({
      where: {
        id: id
      },
      //   attributes: [
      //     'id',
      //     'date',
      //     'time',
      //     'price',
      //     'booking_id',
      //     'status',
      //     'orderId',
      //     'rejected_reason',
      //     'rejected_date'
      //   ],
      include: [
        {
          model: Customer,
          as: 'cart_customer',
          attributes: [
            'firstname',
            'middlename',
            'lastname',
            'id',
            'profile_img',
            'customerId'
          ]
        },
        {
          model: booking_address,
          attributes: [
            'address1',
            'address2',
            'city',
            'pincode',
            'addressName',
            'state',
            'latitude',
            'longitude',
            'address_img'
          ]
        },
        {
          model: vendor_service,
          attributes: ['subcategory', 'service_location'],
          include: [
            {
              model: sub_category,
              attributes: ['name']
            },
            {
              model: vendor_service_review,
              attributes: ['rating', 'comment', 'time', 'images'],
              include: [
                {
                  model: Customer,
                  attributes: [
                    'profile_img',
                    'firstname',
                    'middlename',
                    'lastname'
                  ]
                }
              ]
            }
          ]
        },
        {
          model: booking,
          //   attributes: ['status', 'cancel_date', 'cancel_reason'],
          include: [
            {
              model: payment_details
            },
            {
              model: refund_details,
              attributes: ['id', 'refund_id']
            }
          ]
        }
      ]
    })

    if (!bookings) {
      return res.status(404).json({
        status: false,
        message: 'No Such Booking.'
      })
    }

    const data = {
      cart_id: bookings.id,
      date: bookings.date != null ? formatDateToYYYYMMDD(bookings.date) : null,
      time: bookings.time,
      reschedule_count: bookings?.booking?.reschedule_count,
      previous_reschedule_time: booking?.previous_reschedule_time,
      previous_reschedule_date:
        booking?.previous_reschedule_date != null
          ? formatDateToYYYYMMDD(booking?.previous_reschedule_date)
          : null,
      firstname: bookings.cart_customer.firstname,
      middlename: bookings.cart_customer.middlename,
      lastname: bookings.cart_customer.lastname,
      customer_id: bookings.cart_customer.customerId,
      customer_profile: bookings.cart_customer.profile_img,
      service_name: bookings.vendor_service.sub_category.name,
      service_location: bookings.vendor_service.service_location,
      status: bookings.status,
      booking_status: bookings?.booking?.status,
      orderId: bookings.orderId,
      price: bookings.price,
      address: bookings?.booking_address,
      cancel_reason: bookings?.booking?.cancel_reason,
      cancel_date: bookings?.booking?.cancel_date,
      rejected_date: bookings?.rejected_date,
      rejected_reason: bookings?.rejected_reason,
      review: bookings?.vendor_service_review,
      cart_detail: bookings,
      booking_detail: bookings?.booking,
      payment_detail: bookings?.booking?.payment_details
    }

    // if (bookings.booking && bookings.booking.status !== 'Pending') {
    //   data.booking_status = bookings.booking.status
    // }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: data
    })
  } catch (err) {
    next(err)
  }
}

exports.onRejectedOrder = async (req, res, next) => {
  try {
    const cart_id = req.params.cartId
    const { reason } = req.body
    const cart_detail = await cart.findOne({
      where: {
        id: cart_id
      },
      include: [
        {
          model: vendor_service,
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        },
        {
          model: booking,
          attributes: ['id']
        }
      ]
    })

    if (cart_detail?.status === 'Rejected') {
      return res.status(404).json({
        status: false,
        message: 'It is already rejected.'
      })
    }

    let booking_data = await booking.findOne({
      where: {
        id: cart_detail?.booking?.id
      }
    })

    // console.log(booking_data)
    if (booking_data?.reschedule_status === 'pending') {
      booking_data.reschedule_status = 'rejected'
      booking_data.reschedule_reject_date = new Date()
      booking_data.reschedule_reject_reason = reason
      booking_data.status = 'Upcoming'
      booking_data.time = booking_data.previous_reschedule_time
      booking_data.date = booking_data.previous_reschedule_date
      const new_notification1 = await notification.build({
        person: 'Customer',
        customer: cart_detail?.customer,
        title: 'Service reschedule rejected',
        description: `Your service reschedule request has been rejected by the vendor due to the following reason: ${reason}.`,
        timestamp: Date.now(),
        is_read: false,
        is_delete: false,
        cart_id: cart_detail?.id,
        service_id: cart_detail?.service
      })
      await new_notification1.save()
    } else {
      cart_detail.status = 'Rejected'
      cart_detail.rejected_reason = reason
      cart_detail.rejected_date = new Date()
      const new_notification = await notification.build({
        person: 'Customer',
        customer: cart_detail?.customer,
        title: 'Service rejected',
        description: `Your service has been rejected by the vendor due to the following reason: ${reason}.`,
        timestamp: Date.now(),
        is_read: false,
        is_delete: false,
        cart_id: cart_detail?.id,
        service_id: cart_detail?.service
      })
      await new_notification.save()
    }

    await cart_detail.save()

    await booking_data.save()
    return res.status(200).json({
      status: true,
      message: 'Successful'
    })
  } catch (err) {
    next(err)
  }
}

exports.onAcceptOrder = async (req, res, next) => {
  try {
    const cart_id = req.params.cartId
    const cart_detail = await cart.findOne({
      where: {
        id: cart_id
      },
      include: [
        {
          model: Customer,
          as: 'cart_customer',
          attributes: ['id']
        },
        {
          model: booking,
          attributes: ['id', 'status']
        },
        {
          model: vendor_service,
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        }
      ]
    })

    if (!cart_detail) {
      return res.status(404).json({
        status: false,
        message: 'Something went wrong, check.'
      })
    }

    cart_detail.status = 'Approved'
    let status = 'Pending'
    if (cart_detail?.booking?.status === 'Reschedule') {
      status = 'Upcoming'
      const booking_data = await booking.findOne({
        where: {
          id: cart_detail?.booking?.id
        }
      })
      booking_data.status = status
      booking_data.reschedule_status = 'approved'
      const new_notification1 = await notification.build({
        person: 'Customer',
        customer: cart_detail?.cart_customer?.id,
        title: 'Service reschedule accepted',
        description: `Your service | ${cart_detail?.vendor_service?.sub_category?.name} reschedule has been accepted by Vendor.`,
        timestamp: Date.now(),
        is_read: false,
        is_delete: false,
        cart_id: cart_detail?.id,
        service_id: cart_detail?.service
      })
      await new_notification1.save()
      await booking_data.save()
    } else {
      const booking_record = await booking.build({
        customer: cart_detail.cart_customer.id,
        status: status
      })

      cart_detail.booking_id = booking_record.id
      booking_record.city = 'city'
      booking_record.pincode = 123456
      booking_record.addressName = 'addressName'

      const new_notification = await notification.build({
        person: 'Customer',
        customer: cart_detail?.cart_customer?.id,
        title: 'Service accepted',
        description: `Your service | ${cart_detail?.vendor_service?.sub_category?.name} successfully accepted by Vendor.`,
        timestamp: Date.now(),
        is_read: false,
        is_delete: false,
        cart_id: cart_detail?.id,
        service_id: cart_detail?.service
      })
      await new_notification.save()
      await booking_record.save()
    }
    await cart_detail.save()
    return res.status(200).json({
      status: true,
      message: 'Successful'
    })
  } catch (err) {
    next(err)
  }
}

exports.onSuccessService = async (req, res, next) => {
  try {
    const cart_id = req.params.cartId

    const cart_detail = await cart.findOne({
      where: {
        id: cart_id
      },
      include: [
        {
          model: booking,
          attributes: ['id']
        },
        {
          model: vendor_service,
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        }
      ]
    })

    if (!cart_detail) {
      return res.status(404).json({
        status: false,
        message: 'Something went wrong, check.'
      })
    }
    if (!cart_detail?.booking) {
      return res.status(404).json({
        status: false,
        message: 'Something went wrong, check.'
      })
    }

    const booking_detail = await booking.findOne({
      where: {
        id: cart_detail.booking.id
      }
    })

    booking_detail.status = 'Successful'

    const new_notification = await notification.build({
      person: 'Customer',
      customer: cart_detail?.customer,
      title: 'Service success',
      description: `The service ${cart_detail?.vendor_service?.sub_category?.name} has been successfully completed by the vendor.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_detail?.id,
      service_id: cart_detail?.service
    })

    await booking_detail.save()
    await new_notification.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.onCancelOrder = async (req, res, next) => {
  try {
    const cartId = req.body.cartId
    const vendor_cancel_reason = req.body.cancel_reason

    const cart_data = await cart.findOne({
      where: {
        id: cartId,
        deleted: false
      },
      attributes: [
        'id',
        'status',
        'date',
        'customer',
        'service',
        'calendar_id'
      ],
      include: [
        {
          model: booking,
          attributes: ['id', 'status']
        },
        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: ['firstname']
        },
        {
          model: Customer,
          as: 'cart_customer',
          attributes: ['mobileNumber']
        },
        {
          model: vendor_service,
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        }
      ]
    })

    if (!cart_data) {
      return res.status(400).json({ status: false, message: 'cart not found.' })
    }

    const currentDate = new Date()
    const cartDate = new Date(cart_data.date)

    // Check if the current date is not exceeding the date in the cart
    // if (currentDate > cartDate) {
    //   return res.status(400).json({
    //     status: false,
    //     message: 'Cannot cancel, order has already expired'
    //   })
    // }

    if (
      cart_data.status === 'rejected' ||
      cart_data?.booking.status === 'Cancelled' ||
      cart_data?.booking.status === 'Vendor_Cancel'
    ) {
      return res
        .status(400)
        .json({ status: false, message: 'Booking is already cancelled.' })
    }

    const booking_data = await booking.findOne({
      where: {
        id: cart_data.booking.id
      },
      attributes: ['id', 'status', 'payment_status'],
      include: [
        {
          model: payment_details,
          attributes: ['id', 'checkout_session']
        }
      ]
    })

    if (!booking_data) {
      return res.status(404).json({
        status: false,
        message: 'Booking not found please check again.'
      })
    }

    let payment
    if (booking_data?.payment_detail?.dataValues?.id) {
      payment = await payment_details.findOne({
        where: {
          id: booking_data?.payment_detail?.dataValues?.id
        }
      })
    }
    booking_data.vendor_cancel_stage =
      booking_data?.payment_status === 'paid'
        ? 'after_payment'
        : 'before_payment'
    booking_data.refund_status =
      booking_data?.vendor_cancel_stage === 'after_payment' ? 'Pending' : null
    booking_data.status = 'Vendor_Cancel'
    booking_data.vendor_cancel_reason = vendor_cancel_reason
    booking_data.vendor_cancel_date = new Date()
    // cart_data.deleted = true
    if (payment) {
      payment.refund_status = 'pending'
    }

    let refund_d
    if (
      booking_data?.payment_detail?.checkout_session &&
      booking_data?.payment_detail?.checkout_session !== 'null'
    ) {
      try {
        let retrieved = await stripe.checkout.sessions.retrieve(
          booking_data?.payment_detail?.checkout_session
        )
        if (
          retrieved.status !== 'expired' &&
          retrieved.status !== 'complete' &&
          retrieved.status !== 'paid'
        ) {
          await stripe.checkout.sessions.expire(
            booking_data?.payment_detail?.checkout_session
          )
        }
      } catch (err) {}
    }

    if (booking_data?.payment_status === 'paid' && payment?.payment_intent_id) {
      const refund = await stripe.refunds.create({
        payment_intent: payment?.payment_intent_id,
        amount: parseInt(payment.amount)
      })
      if (refund) {
        refund_d = await refund_details.build({
          booking_id: booking_data?.id,
          refund_id: refund?.id,
          payment_intent_id: refund.payment_intent,
          amount: refund?.amount
        })
        await refund_d.save()
        booking_data.refund = refund_d.id
        booking_data.refund_status = 'Done'
        booking_data.refund_date = new Date()
        payment.refund_status = 'done'
        payment.refund_date = new Date()
      } else {
        console.log('refund is not created.')
      }
    }
    // console.log(cart_data?.calendar_id, '----------------------')
    if (cart_data?.calendar_id) {
      let calendar_data = await calendar_booking_data.findOne({
        where: {
          id: cart_data?.calendar_id,
          deleted: false
        }
      })
      calendar_data.deleted = true
      await calendar_data.save()
    }

    const new_notification = await notification.build({
      person: 'Customer',
      customer: cart_data?.customer,
      title: 'Service cancelled',
      description: `The vendor has canceled your service for the following reason: ${vendor_cancel_reason}. As soon as possible, initiate the refund process for this service.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_data?.id,
      service_id: cart_data?.service
    })

    sendMobileVerificationCode({
      mobileNumber: cart_data?.cart_customer?.mobileNumber,
      message: `The service for the ${cart_data?.vendor_service?.sub_category?.name} has been cancelled by ${cart_data?.cart_vendor?.firstname}`
    })

    if (payment) await payment.save()
    await cart_data.save()
    await booking_data.save()
    await new_notification.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getLocationData = async (req, res, next) => {
  try {
    const cartId = req.params.cartId
    const data = await cart.findOne({
      where: {
        id: cartId
      },
      attributes: ['service'],
      include: [
        {
          model: booking_address,
          attributes: ['latitude', 'longitude']
        }
      ]
    })
    let result = {}
    if (data) {
      result.longitude = data?.booking_address?.longitude
      result.latitude = data?.booking_address?.latitude
      result.servcieId = data?.service
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.startServicePath = async (req, res, next) => {
  try {
    const cartId = req.params.id
    const data = await cart.findOne({
      where: {
        id: cartId
      }
    })
    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong.' })
    }
    if (data) data.location_status = 'start'
    await data.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.cancelServicePath = async (req, res, next) => {
  try {
    const cartId = req.params.id
    const data = await cart.findOne({
      where: {
        id: cartId
      }
    })
    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong.' })
    }
    if (data) data.location_status = 'pending'
    await data.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.completeServicePath = async (req, res, next) => {
  try {
    const cartId = req.params.id
    const data = await cart.findOne({
      where: {
        id: cartId
      }
    })
    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong.' })
    }
    if (data) data.location_status = 'complete'
    await data.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}
