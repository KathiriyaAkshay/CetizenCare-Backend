const db = require('../../models')
const moment = require('moment')
const cart = db.cart
const booking = db.booking
const payment_details = db.payment_details
const vendor_service = db.vendor_service
const Vendor = db.Vendor
const customer_address = db.customer_address
const vendor_postal_address = db.vendor_postal_address
const sub_category = db.sub_category
const admin_coupon = db.admin_coupon
const vendor_coupon = db.vendor_coupon
const Sequelize = db.Sequelize
const Customer = db.Customer
const booking_coupon_code = db.booking_coupon_code
const booking_address = db.booking_address
const vendor_service_review = db.vendor_service_review
const refund_details = db.refund_details
const notification = db.notification
const calendar_booking_data = db.calendar_booking_data
const vendor_calendar_data = db.vendor_calendar_data

require('dotenv').config()
const Stripe = require('stripe')
const { charge_successful } = require('../../socket')
const {
  sendMobileVerificationCode
} = require('../../services/mobileService/mobileService')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

function formatDateToYYYYMMDD (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Adding 1 because months are zero-based
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initiateBooking = async data => {
  //   const data = payment_intent_created.metadata
  //   console.log(data)
  try {
    // const booking_details = await booking.build({
    //   tip: data.tip,
    //   customer: data.customerId,
    //   coupon_code: data.couponId,
    //   address_id: data.addressId,
    //   amount: data.amount,
    //   city: 'dummy',
    //   pincode: 1234,
    //   addressName: 'addressName',
    //   convenience_fee: data.convenience_fee
    // })
    // await booking_details.save()
  } catch (err) {
    console.log(err)
  }
}

const payment_intent_create = async data => {
  try {
    const cart_model = await cart.findOne({
      where: {
        id: data.metadata.cartId
      },
      attributes: ['booking_id']
    })

    const payment = await payment_details.findOne({
      where: {
        booking_id: cart_model.booking_id
      }
    })

    payment.payment_intent_id = data.payment_intent_id
    payment.payment_intent_created_at = data.payment_intent_created_at
    payment.payment_intent_amount = data.payment_intent_amount
    payment.payment_intent_status = data.payment_intent_status
    await payment.save()
  } catch (err) {
    console.log(err)
  }
}

const payment_intent_success = async data => {
  try {
    // console.log(data)

    const cart_model = await cart.findOne({
      where: {
        id: data.cartId
      },
      attributes: ['booking_id']
    })

    const payment = await payment_details.findOne({
      where: {
        booking_id: cart_model.booking_id
      }
    })
    payment.payment_intent_status = 'success'
    await payment.save()
  } catch (err) {
    console.log(err)
  }
}

const charge_succeeded = async data => {
  try {
    const cart_model = await cart.findOne({
      where: {
        id: data.metadata.cartId
      },
      attributes: ['id', 'booking_id', 'service', 'vendor', 'customer', 'date'],
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
          model: Customer,
          as: 'cart_customer',
          attributes: ['mobileNumber']
        },
        {
          model: calendar_booking_data,
          attributes: ['id']
        }
      ]
    })

    const booking_details = await booking.findOne({
      where: {
        id: cart_model.booking_id
      }
    })

    booking_details.payment_status = 'paid'
    booking_details.status = 'Upcoming'
    cart_model.deleted = true
    const payment = await payment_details.findOne({
      where: {
        booking_id: cart_model.booking_id
      }
    })

    await calendar_booking_data.update(
      { payment_status: true },
      { where: { id: cart_model?.calendar_booking_datum?.id } }
    )

    payment.status = 'successful'
    payment.time = data.created
    payment.amount = data.amount
    payment.trasaction_id = data.balance_transaction
    payment.receipt_url = data.receipt_url
    // await cart_model.save()
    await booking_details.save()
    await payment.save()
    // charge_successful(req.io, {
    //   type: 'System',
    //   message: 'charge_succeeded',
    //   vendorId: cart_model?.vendor,
    //   payment_successful: 'Payment_Successful',
    //   service_details: {
    //     id: cart_model?.service,
    //     date: cart_model?.date,
    //     price: cart_model?.price,
    //     quantity: cart_model?.quantity
    //   }
    // })
    const new_notification1 = await notification.build({
      person: 'Vendor',
      vendor: cart_model?.vendor,
      title: 'Payment successful',
      description: `The payment for the ${cart_model?.vendor_service?.sub_category?.name} service has been successfully completed.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_model?.id,
      service_id: cart_model?.service
    })

    let date = new Date(cart_model?.date)
    let formattedDate = moment(date).format('DD-MM-YYYY')

    const new_notification3 = await notification.build({
      person: 'Vendor',
      vendor: cart_model?.vendor,
      title: 'New order',
      description: `You have a new order of ${cart_model?.vendor_service?.sub_category?.name} on ${formattedDate}. Please check the order details.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_model?.id,
      service_id: cart_model?.service
    })

    const new_notification2 = await notification.build({
      person: 'Customer',
      customer: cart_model?.customer,
      title: 'Payment successful',
      description: `The payment for the ${cart_model?.vendor_service?.sub_category?.name} service has been successfully completed.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_model?.id,
      service_id: cart_model?.service
    })

    sendMobileVerificationCode({
      mobileNumber: cart_model?.cart_customer?.mobileNumber,
      message: `The payment for the ${cart_model?.vendor_service?.sub_category?.name} service has been successfully completed.`
    })

    await new_notification1.save()
    await new_notification2.save()
    await new_notification3.save()
  } catch (err) {
    console.log(err)
  }
}
const payment_intent_payment_failed = async data => {
  try {
    const cart_model = await cart.findOne({
      where: {
        id: data.metadata.cartId
      },
      attributes: ['booking_id']
    })

    const booking_details = await booking.findOne({
      where: {
        id: cart_model.booking_id
      }
    })

    booking_details.payment_status = 'pending'

    const payment = await payment_details.findOne({
      where: {
        booking_id: cart_model.booking_id
      }
    })

    payment.status = 'failed'
    payment.time = Date.now().toString()
  } catch (err) {
    console.log(err)
  }
}

const payment_intent_cancel = async data => {
  try {
    const cart_model = await cart.findOne({
      where: {
        id: data.metadata.cartId
      },
      attributes: ['booking_id']
    })

    const booking_details = await booking.findOne({
      where: {
        id: cart_model.booking_id
      }
    })

    const payment = await payment_details.findOne({
      where: {
        booking_id: cart_model.booking_id
      }
    })

    payment.payment_intent_canceled_at = data.canceled_at
    payment.payment_intent_cancellation_reason =
      data.payment_intent_cancellation_reason

    await payment.save()
    await booking_details.save()
    await cart_model.save()
  } catch (err) {
    console.log(err)
  }
}

const completeBooking = async data => {
  try {
    const cart_details = await cart.findOne({
      where: data.cartId
    })

    const booking_details = await booking.findOne({
      where: {
        id: cart_details.booking_id
      }
    })

    booking_details.payment_status = 'paid'
    const payment = await payment_details.build({
      booking_details: booking_details.id,
      time: Date.now().toString(),
      amount: data.amount,
      status: 'successful',
      method: 'card',
      trasaction_id: data.transaction_id
    })
    await booking_details.save()

    if (!booking_details) {
      throw new Error('Booking not generated.')
    }
  } catch (err) {
    console.log(err)
  }
}

exports.getCarts = async (req, res, next) => {
  const id = req.user.id
  try {
    const carts = await cart.findAll({
      where: {
        customer: id,
        deleted: {
          [db.Sequelize.Op.not]: true
        },
        status: {
          [db.Sequelize.Op.in]: ['Pending', 'Approved']
        }
      },
      attributes: ['id', 'price', 'quantity', 'status', 'orderId'],
      include: [
        {
          model: vendor_service,
          attributes: ['images', 'service_location'],
          include: [
            {
              model: sub_category,
              attributes: ['name']
            },
            {
              model: Vendor,
              attributes: [
                'id',
                'firstname',
                'middlename',
                'lastname',
                'profile_img'
              ]
            },
            {
              model: vendor_postal_address,
              attributes: [
                'addressName',
                'address1',
                'address2',
                'city',
                'state',
                'pincode',
                'latitude',
                'longitude',
                'address_img'
              ]
            }
          ]
        },
        {
          model: booking,
          attributes: ['id', 'status']
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
            'longitude',
            'address_img'
          ]
        },
        {
          model: calendar_booking_data,
          attributes: ['time_slot', 'date']
        }
      ],
      order: [['updatedAt', 'DESC']]
    })

    if (!carts) {
      return res.status(404).json({ status: false, message: 'Cart not found.' })
    }

    let response = carts.map(item => {
      let result
      if (item?.booking?.status === 'Pending') {
        result = {
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          status: item.status,
          service_images: item.vendor_service.images,
          service_location: item.vendor_service.service_location,
          service_name: item.vendor_service.sub_category.name,
          vendor_fname: item.vendor_service.Vendor.firstname,
          vendor_mname: item.vendor_service.Vendor.middlename,
          vendor_lname: item.vendor_service.Vendor.lastname,
          vendor_profile_img: item.vendor_service.Vendor.profile_img,
          address: item.vendor_service.vendor_postal_address,
          booking_status: item?.booking?.status,
          orderId: item.orderId,
          vendor_id: item.vendor_service.Vendor.id,
          address: item?.booking_address,
          calendar_booking_data: item?.calendar_booking_datum
        }
      } else if (item.status === 'Pending') {
        result = {
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          status: item.status,
          service_images: item.vendor_service.images,
          service_location: item.vendor_service.service_location,
          service_name: item.vendor_service.sub_category.name,
          vendor_fname: item.vendor_service.Vendor.firstname,
          vendor_mname: item.vendor_service.Vendor.middlename,
          vendor_lname: item.vendor_service.Vendor.lastname,
          vendor_profile_img: item.vendor_service.Vendor.profile_img,
          address: item.vendor_service.vendor_postal_address,
          orderId: item.orderId,
          vendor_id: item.vendor_service.Vendor.id,
          address: item?.booking_address,
          calendar_booking_data: item?.calendar_booking_datum
        }
      }
      return result
    })

    response = response.filter(item => {
      if (item !== null) {
        return item
      }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: response })
  } catch (err) {
    next(err)
  }
}

exports.editCart = async (req, res, next) => {
  const cart_id = req.params.cartId
  const { time, date, quantity } = req.body
  try {
    const cart_detail = await cart.findOne({
      where: {
        id: cart_id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      include: [
        {
          model: booking,
          attributes: ['status']
        }
      ]
    })

    //TODO : Handle leave time of service agent

    if (!cart_detail) {
      return res
        .status(404)
        .json({ status: false, message: 'Cart details not found.' })
    }

    if (time || date) {
      if (
        cart_detail.status &&
        (['Rejected'].includes(cart_detail.status) ||
          (cart_detail.status === 'Approved' &&
            cart_detail?.booking?.status !== 'Reschedule'))
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Your request is already proceed further so you can't change time or date."
        })
      } else {
        if (time) cart_detail.time = time
        if (date) cart_detail.date = date
      }
    }

    if (quantity) cart_detail.quantity = quantity
    await cart_detail.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteCart = async (req, res, next) => {
  const cart_id = req.params.cartId
  try {
    const cart_detail = await cart.findOne({
      where: {
        id: cart_id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (!cart_detail) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no such cart.' })
    }

    // if (
    //   cart_detail.status &&
    //   ['Rejected', 'Approved'].includes(cart_detail.status) // check scenario that what if some has deleted pending cart because pending cart will be shown to vendor and they have to refresh the screen otherwise it may break or error
    // ) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Can't delete this as this proceeded further"
    //   })
    // }

    cart_detail.deleted = true

    await calendar_booking_data.update(
      { deleted: true },
      { where: { id: cart_detail?.calendar_id } }
    )
    await cart_detail.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.checkoutStep1 = async (req, res, next) => {
  try {
    const {
      couponId,
      addressId,
      cartId,
      tip,
      convenience_fee,
      coupon_create_by,
      service_location
    } = req.body

    let coupon_data = []
    // let address_data = []
    const coupon_field = [
      'offer_name',
      'offer_type',
      'percentage',
      'offer_code',
      'maxAmount',
      'maxDiscount'
    ]

    // const address_field_vendor = [
    //   'address1',
    //   'address2',
    //   'city',
    //   'pincode',
    //   'addressName',
    //   'latitude',
    //   'longitude'
    // ]

    // const address_field_customer = [
    //   'address1',
    //   'address12',
    //   'city',
    //   'pincode',
    //   'addressName',
    //   'latitude',
    //   'longitude'
    // ]

    let booking_coupon_code_store
    if (couponId) {
      if (coupon_create_by === 'Admin') {
        coupon_data = await admin_coupon.findOne({
          where: {
            id: couponId
          },
          attributes: coupon_field
        })
      } else {
        coupon_data = await vendor_coupon.findOne({
          where: {
            id: couponId
          },
          attributes: coupon_field
        })
      }

      booking_coupon_code_store = await booking_coupon_code.build(
        coupon_data.dataValues
      )

      await booking_coupon_code_store.save()
    }

    // let booking_address_store
    // if (addressId) {
    //   if (service_location === 'home') {
    //     address_data = await customer_address.findOne({
    //       where: {
    //         id: addressId
    //       },
    //       attributes: address_field_customer
    //     })
    //   } else {
    //     address_data = await vendor_postal_address.findOne({
    //       where: {
    //         id: addressId
    //       },
    //       attributes: address_field_vendor
    //     })
    //   }
    //   booking_address_store = await booking_address.build(
    //     address_data.dataValues
    //   )

    //   await booking_address_store.save()
    // }

    const cart_data = await cart.findOne({
      where: {
        id: cartId
      },
      attributes: ['id', 'booking_id'],
      include: [
        {
          model: booking,
          attributes: ['id']
        }
      ]
    })

    if (!cart_data.booking) {
      return res.status(404).json({
        status: false,
        message: 'booking associated with cart not found.'
      })
    }

    const booking_data = await booking.findOne({
      where: {
        id: cart_data.booking.id
      }
    })

    // booking_data.address_id = booking_address_store?.id
    booking_data.coupon_code = booking_coupon_code_store?.id
    booking_data.tip = tip
    booking_data.convenience_fee = convenience_fee
    await booking_data.save()
    await cart_data.save()

    return res.status(200).json({ status: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getCouponCodes = async (req, res, next) => {
  try {
    const vendorId = req.body.vendorId
    let admin_coupons = await admin_coupon.findAll({
      where: {
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: [
        'id',
        'offer_code',
        'offer_name',
        'description',
        'percentage',
        'maxAmount',
        'maxDiscount'
      ]
    })
    let vendor_coupons = await vendor_coupon.findAll({
      where: {
        vendor_id: vendorId,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: [
        'id',
        'offer_code',
        'offer_name',
        'description',
        'percentage',
        'maxAmount',
        'maxDiscount'
      ],
      order: [['updatedAt', 'DESC']]
    })
    if (admin_coupons.length > 0) {
      admin_coupons = admin_coupons.map(item => {
        return { ...item.dataValues, create_by: 'admin' }
      })
    }
    if (vendor_coupons.length > 0) {
      vendor_coupons = vendor_coupons.map(item => {
        return { ...item.dataValues, create_by: 'vendor' }
      })
    }
    const coupons = [...admin_coupons, ...vendor_coupons]
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: coupons })
  } catch (err) {
    next(err)
  }
}

exports.cancelBooking = async (req, res, next) => {
  try {
    const cartId = req.body.cartId
    const cancel_reason = req.body.cancel_reason

    const cart_data = await cart.findOne({
      where: {
        id: cartId,
        deleted: false
      },
      attributes: ['id', 'status', 'date', 'vendor', 'service', 'calendar_id'],
      include: [
        {
          model: booking,
          attributes: ['id', 'status']
        },
        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: ['mobileNumber']
        },
        {
          model: Customer,
          as: 'cart_customer',
          attributes: ['firstname']
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

    // if (currentDate > cartDate) {
    //   return res.status(400).json({
    //     status: false,
    //     message: 'Cannot cancel, order has already expired.'
    //   })
    // }

    // Check if the current date is not exceeding the date in the cart
    // if (currentDate > cartDate) {
    //   return res.status(400).json({
    //     status: false,
    //     message: 'Cannot cancel, order has already expired.'
    //   })
    // }

    // if (
    //   cart_data?.status === 'rejected' ||
    //   cart_data?.booking?.status === 'Cancelled' ||
    //   cart_data?.booking?.status === 'Vendor_Cancel'
    // ) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: 'Booking is already cancelled.' })
    // }
    if (
      cart_data?.status === 'rejected' ||
      cart_data?.booking?.status === 'Cancelled' ||
      cart_data?.booking?.status === 'Vendor_Cancel'
    ) {
      return res
        .status(400)
        .json({ status: false, message: 'Booking is already cancelled.' })
    }

    const booking_data = await booking.findOne({
      where: {
        id: cart_data?.booking?.id
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
    booking_data.cancel_stage =
      booking_data?.payment_status === 'paid'
        ? 'after_payment'
        : 'before_payment'
    booking_data.refund_status =
      booking_data?.cancel_stage === 'after_payment' ? 'Pending' : null
    booking_data.status = 'Cancelled'
    booking_data.cancel_reason = cancel_reason
    booking_data.cancel_date = new Date()
    if (payment) {
      payment.refund_status = 'pending'
    }

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

    // cart_data.deleted = true
    let refund_d
    if (
      booking_data?.payment_detail?.checkout_session &&
      booking_data?.payment_detail?.checkout_session !== 'null'
    ) {
      //   const session = await stripe.checkout.sessions.retrieve(
      //     booking_data?.payment_detail?.checkout_session
      //   )
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

    const new_notification = await notification.build({
      person: 'Vendor',
      vendor: cart_data?.vendor,
      title: 'Service cancelled',
      description: `The customer has canceled your service for the following reason: ${cancel_reason}.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_data?.id,
      service_id: cart_data?.service
    })

    sendMobileVerificationCode({
      mobileNumber: cart_data?.cart_vendor?.mobileNumber,
      message: `The service for the ${cart_data?.vendor_service?.sub_category?.name} has been cancelled by ${cart_data?.cart_customer?.firstname}`
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

const createPayment = async (data, bookingId) => {
  try {
    const cart_data = await cart.findOne({
      where: {
        id: data.cartId
      },
      attributes: ['status'],
      include: [
        {
          model: booking,
          attributes: ['id', 'status']
        }
      ]
    })

    if (!cart_data) {
      return { status: false, message: 'Cart not found please check again.' }
    }

    const booking_data = await booking.findOne({
      where: {
        id: cart_data.booking.id
      },
      attributes: ['id']
    })

    if (!booking_data) {
      return {
        status: false,
        message: 'Booking not found please check again.'
      }
    }
    let isAlreadyExist = await payment_details.findOne({
      where: {
        booking_id: bookingId
      },
      attributes: ['id', 'checkout_session']
    })
    if (isAlreadyExist && isAlreadyExist?.checkout_session) {
      const session = await stripe.checkout.sessions.retrieve(
        isAlreadyExist?.checkout_session
      )
      if (session && ['pending'].includes(session?.status)) {
        await stripe.checkout.sessions.expire(session.id)
      }
      return {
        status: true,
        message: 'Generate new link',
        data: { payment_id: isAlreadyExist.id }
      }
    }
    const payment_data = await payment_details.build({
      booking_id: booking_data.id,
      amount: data.amount,
      status: 'pending',
      method: 'card'
    })
    await payment_data.save()
    booking_data.payment_id = payment_data.id
    await booking_data.save()

    return {
      status: true,
      message: 'Successful',
      data: { payment_id: payment_data.id }
    }
  } catch (err) {
    return { status: 'Error', message: err }
  }
}

const charge_refund_update = async data => {
  try {
    const refund = await refund_details.findOne({
      where: {
        payment_intent_id: data?.payment_intent
      }
    })
    if (refund) {
      refund.destination_details = data?.destination_details
      refund.charge_id = data.charge
    }
    await refund.save()
  } catch (err) {
    console.log(err, 'charge refund updated, ')
  }
}

const charge_refunded = async data => {
  try {
    const refund_data = await refund_details.findOne({
      where: {
        payment_intent_id: data.payment_intent
      }
    })
    if (refund_data) {
      refund_data.transaction_id = data.balance_transaction
      refund_data.receipt_url = data.receipt_url
      refund_data.amount = data.amount
    }

    await refund_data.save()
  } catch (err) {
    console.log(err, 'charge_refunded')
  }
}
exports.checkout = async (req, res, next) => {
  try {
    const {
      couponId,
      cartId,
      tip,
      bill_json,
      convenience_fee,
      coupon_create_by,
      round_off_price
    } = req.body

    let coupon_data = []
    const coupon_field = [
      'offer_name',
      'offer_type',
      'percentage',
      'offer_code',
      'maxAmount',
      'maxDiscount'
    ]

    let amount = parseInt(req?.body?.amount * 100)

    const cart_data = await cart.findOne({
      where: {
        id: cartId,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: ['id', 'booking_id', 'price'],
      include: [
        {
          model: booking,
          attributes: ['id']
        },
        {
          model: calendar_booking_data,
          attributes: [
            'id',
            'vendor_id',
            'service_id',
            'time_slot',
            'date',
            'createdAt',
            'deleted',
            'payment_status'
          ]
        }
      ]
    })
    if (!cart_data.booking) {
      return res.status(404).json({
        status: false,
        message: 'Booking associated with cart not found'
      })
    }

    let is_time_slot_booked = await calendar_booking_data.findOne({
      where: {
        vendor_id: cart_data?.calendar_booking_datum?.vendor_id,
        service_id: cart_data?.calendar_booking_datum?.service_id,
        time_slot: cart_data?.calendar_booking_datum?.time_slot,
        date: cart_data?.calendar_booking_datum?.date,
        deleted: false,
        payment_status: true
      }
    })

    if (is_time_slot_booked) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'Time slot is not available, Please check again'
        })
    }

    let booking_coupon_code_store
    if (couponId) {
      if (coupon_create_by === 'Admin') {
        coupon_data = await admin_coupon.findOne({
          where: {
            id: couponId
          },
          attributes: coupon_field
        })
      } else {
        coupon_data = await vendor_coupon.findOne({
          where: {
            id: couponId
          },
          attributes: coupon_field
        })
      }
      // let final_price = cart_data?.price - coupon_data?.percentage * cart_data?.price
      // if(final_price !== )
      booking_coupon_code_store = await booking_coupon_code.build(
        {...coupon_data.dataValues,
        create_by: coupon_create_by}
      )

      await booking_coupon_code_store.save()
    }

    // let booking_address_store
    // if (addressId) {
    //   if (service_location === 'home') {
    //     address_data = await customer_address.findOne({
    //       where: {
    //         id: addressId
    //       },
    //       attributes: address_field_customer
    //     })
    //   } else {
    //     address_data = await vendor_postal_address.findOne({
    //       where: {
    //         id: addressId
    //       },
    //       attributes: address_field_vendor
    //     })
    //   }
    //   booking_address_store = await booking_address.build(
    //     address_data.dataValues
    //   )

    //   await booking_address_store.save()
    // }

    const booking_data = await booking.findOne({
      where: {
        id: cart_data.booking.id
      }
    })

    // booking_data.address_id = booking_address_store?.id
    if(round_off_price) cart_data.round_off_price = round_off_price
    booking_data.coupon_code = booking_coupon_code_store?.id
    booking_data.tip = tip
    booking_data.convenience_fee = convenience_fee
    booking_data.bill_json = bill_json
    await booking_data.save()
    await cart_data.save()

    const data = {
      customerId: req.user.id,
      amount: amount,
      cartId: cartId
    }

    const check = await cart.findOne({
      where: {
        id: data.cartId
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
          attributes: ['payment_status', 'id'],
          include: [
            {
              model: payment_details,
              attributes: ['status', 'id']
            }
          ]
        }
      ]
    })
    if (check?.booking?.payment_detail?.dataValues?.status === 'successful') {
      return res
        .status(400)
        .json({ status: false, message: 'Payment already done.' })
    }
    // await initiateBooking(data)
    const result = await createPayment(data, check?.booking?.dataValues?.id)
    if (result.status === 'Error') {
      throw new Error(result.message)
    }
    if (!result.status) {
      return res.status(404).json({ status: false, message: result.message })
    }

    const session = await stripe.checkout.sessions.create({
      metadata: data,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Payment for your service ${check?.vendor_service?.sub_category?.name}`
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      payment_intent_data: {
        metadata: {
          customerId: req.user.id,
          amount: amount,
          cartId: cartId
        }
      },
      mode: 'payment',
      success_url: process.env.CLIENT_SUCCESS_URL,
      cancel_url: process.env.CLIENT_CANCEL_URL
    })
    let payment = await payment_details.findOne({
      where: { id: result.data.payment_id }
    })
    payment.checkout_session = session?.id
    await payment.save()

    if (session?.url) {
      return res
        .status(200)
        .json({ status: true, message: 'Successful', url: session?.url })
    } else {
      return res
        .status(400)
        .json({ status: false, message: 'Unable to create url, try again.' })
    }
    // res.send({ url: session.url })
  } catch (err) {
    next(err)
  }
}

exports.preCheckoutDetail = async (req, res, next) => {
  try {
    const id = req.params.id
    const cart_data = await cart.findOne({
      where: {
        id: id
      },
      attributes: [
        'id',
        'vendor',
        'customer',
        'service',
        'price',
        'quantity',
        'status'
      ],
      include: [
        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: [
            'id',
            'firstname',
            'middlename',
            'lastname',
            'profile_img'
          ]
        },
        {
          model: booking_address,
          attributes: [
            'id',
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
          attributes: ['id', 'images', 'service_location'],
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: calendar_booking_data,
          attributes: ['time_slot', 'date']
        }
      ]
    })

    if (!cart_data) {
      return res.status(404).json({ status: false, message: 'Data not found.' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: cart_data })
  } catch (err) {
    next(err)
  }
}

let endpointSecret = process.env.ENDPOINT_SECRET

exports.webhooks = async (req, res, next) => {
  const sig = req.headers['stripe-signature']
  let event = req.body
  let transaction
  switch (event.type) {
    case 'payment_intent.created':
      try {
        const payment_intent_created = event.data.object
        // payment intent id store in paymentdetails
        // customer id store in paymentdetails ------check once again
        // paymentinetent create time
        // amount into paymentdtails
        // paymentintent success, falied - status
        // pi created updated

        const data = {
          ...payment_intent_created,
          payment_intent_id: payment_intent_created.id,
          payment_intent_created_at: payment_intent_created.created,
          payment_intent_amount: payment_intent_created.amount,
          payment_intent_status: 'success'
        }
        await payment_intent_create(data)
      } catch (err) {
        next(err)
      }
      break

    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object.metadata
      await payment_intent_success(paymentIntentSucceeded)
      break

    case 'checkout.session.completed':
      const checkoutSuccess = event.data.object
      try {
      } catch (err) {
        next(err)
      }
      break

    case 'charge.succeeded':
      const charge = event.data.object
      try {
        await charge_succeeded(charge)
      } catch (err) {
        next(err)
      }
      break

    case 'payment_intent.requires_action':
      console.log('payment_intent.requires_action', event.data.object)
      break

    case 'payment_intent.canceled':
      console.log('payment intent canceled', event.data.object)
      await payment_intent_cancel(event.data.object)
      break
    case 'payment_intent.payment_failed':
      console.log('payment_intent.payment_failed', event.data.object)
      await payment_intent_payment_failed(event.data.object)
      break

    case 'checkout.session.expired':
      console.log('checkout.session.expired', event.data.object)
      break
    case 'charge.failed':
      console.log('charge.failed', event.data.object)
      break
    case 'charge.refund.updated':
      console.log('charge.refund.updated', event.data.object)
      await charge_refund_update(event.data.object)
      break
    case 'charge.refunded':
      console.log('charge.refunded', event.data.object)
      await charge_refunded(event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type} ${event.data}`)
  }

  res.send().end()
}

exports.success = (req, res, next) => {
  console.log('Success')
  return res.status(200).json({ message: 'Successful' })
}

exports.cancel = (req, res, next) => {
  console.log('return')
  return res.status(200).json({ message: 'Return successfully' })
}

// exports.getAllBookings = async (req, res, next) => {
//   try {
//     const customerId = req.user.id

//     const customer = await Customer.findByPk(customerId)
//     if (!customer) {
//       return res
//         .status(404)
//         .json({ status: false, message: 'Customer not found.' })
//     }

//     const bookings = await booking.findAll({
//       where: {
//         customer: customerId
//       },
//       attributes: ['id']
//     })
//     if (!bookings) {
//       return res.status(404).json({
//         status: false,
//         message: 'Customer related booking info not found.'
//       })
//     }

//     const arr = bookings.map(booking => booking.id)
//     const carts = await cart.findAll({
//       where: {
//         booking_id: {
//           [db.Sequelize.Op.in]: arr
//         }
//       },
//       attributes: ['id', 'booking_id', 'time', 'price'],
//       include: [
//         {
//           model: vendor_service,
//           attributes: ['images'],
//           include: [
//             {
//               model: sub_category,
//               attributes: ['name']
//             }
//           ]
//         },
//         {
//           model: booking,
//           attributes: ['status']
//         }
//       ]
//     })
//     if (!carts) {
//       return res
//         .status(404)
//         .json({ status: false, message: 'Booking related cart not found.' })
//     }

//     const data = carts.map(cart => {
//       return {
//         cart_id: cart.id,
//         booking_id: cart.booking_id,
//         name: cart.vendor_service.sub_category.name,
//         images: cart.vendor_service.images,
//         status: cart.booking.status,
//         price: cart.price,
//         time: cart.time
//       }
//     })

//     return res
//       .status(200)
//       .json({ status: true, message: 'Successful', data: data })
//   } catch (err) {
//     next(err)
//   }
// }

// exports.getBookingById = async (req, res, next) => {
//   try {
//     const booking_id = req.query.booking_id
//     const cart_id = req.query.cart_id

//     const details = await cart.findAll({
//       where: {
//         booking_id,
//         id: cart_id
//       },
//       attributes: ['id', 'booking_id', 'time', 'price'],
//       include: [
//         {
//           model: vendor_service,
//           attributes: ['images'],
//           include: [
//             {
//               model: sub_category,
//               attributes: ['name']
//             },
//             {
//               model: Vendor,
//               attributes: ['firstname', 'middlename', 'lastname']
//             }
//           ]
//         },
//         {
//           model: booking,
//           attributes: ['status'],
//           include: [
//             {
//               model: 'booking',
//               attributes: ['address1', 'address2', 'city', 'pincode']
//             }
//           ]
//         }
//       ]
//     })
//   } catch (err) {
//     next(err)
//   }
// }

exports.getAllBookings = async (req, res, next) => {
  try {
    const userId = req.user.id
    const booking_data = await cart.findAll({
      where: {
        customer: userId,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      include: [
        {
          model: vendor_service,
          attributes: ['images', 'service_location', 'id'],
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        },
        {
          model: booking
        },
        {
          model: booking_address,
          attributes: [
            'id',
            'address1',
            'address2',
            'city',
            'pincode',
            'addressName',
            'latitude',
            'longitude',
            'state'
          ]
        }
      ]
    })

    filter_data = booking_data.filter(item => {
      return (
        (item.status !== 'Pending' &&
          item.status === 'Approved' &&
          item?.booking?.status !== 'Pending') ||
        item.status === 'Rejected' ||
        item?.booking?.reschedule_status === 'approved' ||
        item?.booking?.reschedule_count === 'rejected'
      )
    })
    data = filter_data.map(item => {
      return {
        cartId: item.id,
        name: item?.vendor_service?.sub_category?.name,
        time: item?.time,
        date: item?.date != null ? formatDateToYYYYMMDD(item?.date) : null,
        reschedule_count: item?.booking?.reschedule_count,
        previous_reschedule_time: item?.previous_reschedule_time,
        previous_reschedule_date:
          item?.previous_reschedule_date != null
            ? formatDateToYYYYMMDD(item?.previous_reschedule_date)
            : null,
        images: item?.vendor_service?.images,
        price: item.price,
        cart_status: item.status,
        booking: item?.booking,
        vendor_id: item?.vendor,
        service_id: item?.vendor_service?.id
      }
    })

    data = data.sort((a, b) => {
      const statusOrder = { Upcoming: 0, Successful: 1, Cancelled: 2 }
      const statusComparison =
        Number(statusOrder[a?.booking?.status] ?? 3) - Number(statusOrder[b?.booking?.status] ?? 3)

      if (statusComparison !== 0) return statusComparison

      const dateA = a.date ? new Date(a.date) : null
      const dateB = b.date ? new Date(b.date) : null

      if (dateA && dateB) {
        return dateB - dateA
      } else if (dateA) {
        return 1
      } else if (dateB) {
        return -1
      } else {
        return 0
      }
    })

    // let data = [...first, ...second]
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

exports.getBookingByID = async (req, res, next) => {
  try {
    const id = req.params.id
    const cart_data = await cart.findOne({
      where: {
        id: id
      },
      //   attributes: [
      //     'id',
      //     'orderId',
      //     'status',
      //     'price',
      //     'time',
      //     'quantity',
      //     'date',
      //     'rejected_reason',
      //     'rejected_date'
      //   ],
      include: [
        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: [
            'id',
            'firstname',
            'middlename',
            'lastname',
            'profile_img'
          ]
        },
        {
          model: booking_address,
          attributes: [
            'id',
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
          attributes: ['id', 'images', 'service_location'],
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name']
            },
            {
              model: vendor_service_review,
              attributes: ['id', 'rating', 'comment', 'time', 'images'],
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
          //   attributes: [
          //     'status',
          //     'convenience_fee',
          //     'tip',
          //     'bill_json',
          //     'cancel_reason',
          //     'cancel_date',
          //     'cancel_stage',
          //     'refund_status',
          //     'refund_date'
          //   ],
          include: [
            {
              model: payment_details
              //   attributes: [
              //     'id',
              //     'time',
              //     'amount',
              //     'status',
              //     'method',
              //     'trasaction_id',
              //     'refund_status',
              //     'refund_date',
              //     'payment_intent_id',
              //     'receipt_url'
              //   ]
            },
            {
              model: booking_coupon_code,
              attributes: [
                'id',
                'offer_code',
                'offer_type',
                'offer_name',
                'percentage',
                'maxAmount',
                'maxDiscount'
              ]
            },
            {
              model: refund_details,
              attributes: ['id', 'refund_id']
            }
          ]
        }
      ]
    })

    if (!cart_data) {
      return res.status(404).json({ status: false, message: 'Data not found.' })
    }

    let data = {
      cartId: cart_data.id,
      orderId: cart_data.orderId,
      cart_status: cart_data.status,
      reschedule_count: cart_data?.booking?.reschedule_count,
      previous_reschedule_time: cart_data?.previous_reschedule_time,
      previous_reschedule_date:
        cart_data?.previous_reschedule_date !== null
          ? formatDateToYYYYMMDD(cart_data?.previous_reschedule_date)
          : null,
      booking_status: cart_data?.booking?.status,
      price: cart_data.price,
      bill_amount: cart_data?.booking?.bill_json,
      quantity: cart_data.quantity,
      date: cart_data.date,
      time: cart_data.time,
      vendor_details: cart_data.cart_vendor,
      service_id: cart_data?.vendor_service?.id,
      service_images: cart_data?.vendor_service?.images,
      service_location: cart_data?.vendor_service?.service_location,
      service_name: cart_data?.vendor_service?.sub_category.name,
      booking_status: cart_data?.booking?.status,
      convenience_fee: cart_data?.booking?.convenience_fee,
      tip: cart_data?.booking?.tip,
      address: cart_data?.booking_address,
      cancel_reason: cart_data?.booking?.cancel_reason,
      cancel_date: cart_data?.booking?.cancel_date,
      rejected_reason: cart_data?.rejected_reason,
      rejected_date: cart_data?.rejected_date,
      cancel_stage: cart_data?.booking?.cancel_stage,
      vendor_cancel_stage: cart_data?.booking?.vendor_cancel_stage,
      refund_status: cart_data?.booking?.refund_status,
      refund_date: cart_data?.booking?.refund_date,
      payment_details: cart_data?.booking?.payment_details,
      booking_coupon_code: cart_data?.booking?.booking_coupon_code,
      rating:
        cart_data?.vendor_service?.vendor_service_reviews[0]?.dataValues
          .average_rating ?? 0,
      reviews:
        cart_data?.vendor_service?.vendor_service_reviews[0]?.dataValues
          .review_count ?? 0,

      cart_detail: cart_data,
      booking_detail: cart_data?.booking,
      payment_detail: cart_data?.booking?.payment_details
    }

    if (data.booking_status === 'Cancelled') {
      data.cancel_reason = cart_data?.booking?.cancel_reason
      data.cancel_date = cart_data?.booking?.cancel_date
    }

    if (data.booking_status === 'Vendor_Cancel') {
      data.vendor_cancel_reason = cart_data?.booking?.vendor_cancel_reason
      data.vendor_cancel_date = cart_data?.booking?.vendor_cancel_date
    }

    // if(cart_data?.bookings?.status === 'Cancelled'){
    //     data.refund_status = cart_data?.payment_details[0]?.refund_status,
    //     data.refund_date = cart_data?.payment_details[0]?.refund_date
    // }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

exports.pendingServiceReason = async (req, res, next) => {
  try {
    const user = req.user.id
    const { bookingId, reason } = req.body

    const booking_detail = await booking.findOne({
      where: {
        customer: user,
        id: bookingId
      }
    })

    if (!booking_detail) {
      return res
        .status(404)
        .json({ status: false, message: 'Booking not found.' })
    }

    if (reason) booking_detail.service_pending_reason = reason
    booking_detail.service_pending_date = new Date()
    await booking_detail.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.onCancelPayment = async (req, res, next) => {
  try {
    const cartId = req.body.cartId
    const cart_data = await cart.findOne({
      where: { id: cartId },
      include: [
        {
          model: booking,
          attributes: ['id'],
          include: [
            {
              model: payment_details,
              attributes: ['id', 'checkout_session']
            }
          ]
        }
      ]
    })
    if (!cart_data) {
      return res.status(400).json({
        status: false,
        message: 'Something went wrong unable to find cart.'
      })
    }

    const booking_data = await booking.findOne({
      where: {
        id: cart_data?.booking?.id
      }
    })

    if (!booking_data) {
      return res
        .status(404)
        .json({ status: false, message: 'Booking not found.' })
    }

    const payment_data = await payment_details.findOne({
      where: {
        id: cart_data?.booking?.payment_detail?.id
      }
    })

    if (!payment_data) {
      return res
        .status(404)
        .json({ status: false, message: 'Payment record not found.' })
    }
    // booking_data.status = 'Cancelled'
    // booking_data.cancel_date = new Date()

    if (cart_data?.booking?.payment_detail?.checkout_session) {
      try {
        await stripe.checkout.session.expire(
          cart_data?.booking?.payment_detail?.checkout_session
        )
        payment_data.status = 'failed'
      } catch (err) {}
    }
    // cart_data.deleted = true
    // await cart_data.save()
    await payment_data.save()
    await booking_data.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.onRescheduleService = async (req, res, next) => {
  try {
    const { cart_id, time, date } = req.body

    const cart_data = await cart.findOne({
      where: {
        id: cart_id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: ['id', 'date', 'time', 'vendor', 'service'],
      include: [
        {
          model: booking,
          attributes: ['id', 'status', 'reschedule_count']
        },
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
          model: Vendor,
          as: 'cart_vendor',
          attributes: ['mobileNumber']
        },
        {
          model: calendar_booking_data,
          attributes: ['time_slot', 'id']
        }
      ]
    })

    if (!cart_data) {
      return res.status(404).json({ status: false, message: 'Cart not found.' })
    }

    if (cart_data?.date < Date.now()) {
      return res
        .status(400)
        .json({ status: false, message: 'Service date is already passed.' })
    }
    const booking_data = await booking.findOne({
      where: {
        id: cart_data?.booking?.id
      }
    })

    if (!booking_data) {
      return res.status(404).json({
        status: false,
        message: 'Something went wrong, please try again.'
      })
    }

    if (booking_data?.reschedule_count !== 0) {
      return res
        .status(400)
        .json({ status: false, message: 'You can reschedule only once.' })
    }

    const cal_data = await calendar_booking_data.findAll({
      where: {
        vendor_id: cart_data?.vendor,
        service_id: cart_data?.service,
        date: date,
        deleted: false
      }
    })
    const timeSlotsArray = []
    if (cal_data.length !== 0) {
      cal_data.forEach(item => {
        const timeSlot = Object.values(item)[0]
        timeSlotsArray.push(timeSlot)
      })
    }

    const cal_slot_data = await vendor_calendar_data.findAll({
      where: {
        vendor_id: cart_data?.vendor,
        service_id: cart_data?.service
      },
      attributes: ['time_slot']
    })

    let isBlocked = false
    if (timeSlotsArray.length !== 0) {
      timeSlotsArray.forEach(ele => {
        if (cal_slot_data.includes(ele)) {
          isBlocked = true
        }
      })
    }

    if (isBlocked) {
      return res
        .status(400)
        .json({ status: false, message: 'Slot unavailable' })
    }

    let id = cart_data?.calendar_booking_datum?.id
    const update = await calendar_booking_data.findOne({
      where: { id: id },
      deleted: false
    })
    if (!update)
      return res
        .status(404)
        .json({ status: false, message: 'Calendar booking data not found.' })

    update.time_slot = time
    update.date = date
    cart_data.previous_reschedule_time = cart_data.time
    cart_data.previous_reschedule_date = cart_data.date
    cart_data.time = time
    cart_data.date = date
    booking_data.reschedule_count += 1
    booking_data.reschedule_status = 'approved'
    booking_data.status = 'Upcoming'

    const new_notification = await notification.build({
      person: 'Vendor',
      vendor: cart_data?.vendor,
      title: 'Service reschedule',
      description: `Your service | ${cart_data?.vendor_service?.sub_category?.name} is reschedule, Please check that.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: cart_data?.id,
      service_id: cart_data?.service
    })

    sendMobileVerificationCode({
      mobileNumber: cart_data?.cart_vendor?.mobileNumber,
      message: `Your service | ${cart_data?.vendor_service?.sub_category?.name} is reschedule, Please check that.`
    })

    await update.save()
    await cart_data.save()
    await booking_data.save()
    await new_notification.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getAdminCoupons = async (req, res, next) => {
  try {
    const offers = await admin_coupon.findAll({
      where: {
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: [
        'id',
        'offer_name',
        'offer_type',
        'percentage',
        'offer_code',
        'description',
        'image',
        'bg_color',
        'maxAmount',
        'maxDiscount',
        'admin_id',
        'start_date',
        'end_date'
      ]
    })

    if (!offers) {
      return res
        .status(404)
        .json({ status: false, message: 'Offers not found for this vendor.' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: offers })
  } catch (err) {
    next(err)
  }
}
