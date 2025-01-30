const db = require('../../models')
const Customer = db.Customer
const notification = db.notification
const cart = db.cart
const booking = db.booking
const vendor_service = db.vendor_service
const sub_category = db.sub_category
const Sequelize = db.Sequelize
const calendar_booking_data = db.calendar_booking_data
const vendor_calendar_data = db.vendor_calendar_data
const Vendor = db.Vendor
const blacklisted_token = db.blacklisted_token
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

const {
  sendMobileVerificationCode
} = require('../../services/mobileService/mobileService')
const {
  sendEmailVarification
} = require('../../services/emailService/emailService')
const bcrypt = require('bcrypt')
const payment_details = require('../../models/payment_details')

exports.getProfile = async (req, res, next) => {
  try {
    const id = req.user.id

    const details = await Customer.findOne({
      where: {
        id
      },
      attributes: [
        'id',
        'profile_img',
        'firstname',
        'middlename',
        'lastname',
        'dob',
        'mobileNumber',
        'email'
      ]
    })
    if (!details) {
      return res
        .status(404)
        .json({ status: false, message: 'Details not found.' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: details })
  } catch (err) {
    next(err)
  }
}

exports.editProfile = async (req, res, next) => {
  try {
    const id = req.user.id
    const { profile_img, firstname, middlename, lastname, dob } = req.body
    const details = await Customer.findOne({
      where: { id }
    })

    if (!details) {
      return res
        .status(404)
        .json({ status: false, message: 'Profile is missing.' })
    }

    if (profile_img) details.profile_img = profile_img
    if (firstname) details.firstname = firstname
    if (middlename) details.middlename = middlename
    if (lastname) details.lastname = lastname
    if (dob) details.dob = dob

    await details.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.sendOtpToMobile = async (req, res, next) => {
  try {
    const id = req.user.id
    const { new_mobile } = req.body
    const user = await Customer.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Sorry not able to recognize. Please try again'
      })
    }

    const isExist = await Customer.findOne({
      where: {
        mobileNumber: new_mobile
      }
    })

    if (isExist) {
      return res.status(400).json({
        status: false,
        message: 'User already exist with this mobile number'
      })
    }

    if (user.mobileNumber == new_mobile) {
      return res.status(404).json({
        status: false,
        message: 'You can not enter same mobile number as current'
      })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    // user.mobileNumber = new_mobile
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry
    // user.mobileVerified = false

    const message = `Your Verification Code is ${otp} for update mobile number at CetizenCare`

    await sendMobileVerificationCode({
      mobileNumber: new_mobile,
      message
    })

    await user.save()
    return res.status(200).json({
      status: true,
      message: 'Successful' //Otp is sent to your mobile number for otp verification.
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.verifyMobileNumberForReset = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body
    const user = await Customer.findOne({ where: { id: req.user.id } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    // Check if OTP matches and has not expired
    if (
      user.mobileVerificationCode !== otp ||
      user.mobileVerificationExpiry < new Date()
    ) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid OTP or OTP has expired' })
    }

    // Mark email as verified
    user.mobileNumber = mobileNumber
    user.mobileVerified = true
    user.mobileVerificationCode = null
    user.mobileVerificationExpiry = null
    await user.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.sendOtpToEmail = async (req, res, next) => {
  try {
    const id = req.user.id
    const { new_email } = req.body

    const user = await Customer.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    const isExist = await Customer.findOne({
      where: {
        email: new_email
      }
    })

    if (isExist) {
      return res.status(400).json({
        status: false,
        message: 'User already exist with this email'
      })
    }

    if (user.email == new_email) {
      return res.status(404).json({
        status: false,
        message: 'You can not enter same mobile number as current.'
      })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    // user.email = new_email
    // user.emailVerified = false
    user.emailVerificationOTP = otp
    user.emailVerificationExpiry = otpExpiry

    const message = `${otp}`

    await sendEmailVarification({
      email: new_email,
      subject: 'Email verification for email update at CetizenCare',
      message
    })

    await user.save()

    return res.status(201).json({
      status: true,
      message: 'Successful'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.verifyEmailNumberForReset = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    const user = await Customer.findOne({ where: { id: req.user.id } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    // Check if OTP matches and has not expired
    if (
      user.emailVerificationOTP !== otp ||
      user.emailVerificationExpiry < new Date()
    ) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid OTP or OTP has expired' })
    }

    // Mark email as verified
    user.email = email
    user.emailVerified = true
    user.emailVerificationOTP = null
    user.emailVerificationExpiry = null
    await user.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.updatePassword = async (req, res, next) => {
  const { current_password, new_password } = req.body
  try {
    const id = req.user.id
    const user = await Customer.findOne({
      where: { id }
    })

    if (!user) {
      res.status(404).json({ status: false, message: 'User not found.' })
    }

    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password
    )

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: 'Current password does not match.' })
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)
    user.password = hashedPassword
    await user.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getNotification = async (req, res, next) => {
  try {
    const result = await notification.findAll({
      where: {
        customer: req.user.id,
        is_delete: {
          [db.Sequelize.Op.not]: true
        }
      },
      createdAt: {
        [db.Sequelize.Op.between]: [
          new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
          new Date()
        ]
      },
        order: [['updatedAt', 'DESC']]
    })

    if (!res)
      return res
        .status(200)
        .json({ status: true, message: 'Successful', data: [] })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.getNotificationAndCartCount = async (req, res, next) => {
  try {
    const customerId = req.user.id
    // const notification_count = await notification.count({
    //   where: {
    //     customer: customerId,
    //     is_read: false,
    //     createdAt: {
    //       [db.Sequelize.Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
    //     }
    //   }
    // })

    // const cart_count = await cart.count({
    //   where: {
    //     customer: customerId,
    //     deleted: {
    //       [db.Sequelize.Op.not]: true
    //     },
    //     status: {
    //       [db.Sequelize.Op.in]: ['Pending', 'Approved']
    //     }
    //   },
    //   include: [
    //     {
    //       model: booking,
    //       where: {
    //         [db.Sequelize.Op.and]: [
    //           {
    //             status: {
    //               [db.Sequelize.Op.in]: ['Pending', 'Reschedule']
    //             }
    //           },
    //           // Only include the booking model's where clause when cart status is 'Approved'
    //           {
    //             '$cart.status$': 'Approved'
    //           }
    //         ]
    //       }
    //     }
    //   ]
    // })

    const id = req.user.id

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
            }
          ]
        },
        {
          model: booking,
          attributes: ['id', 'status']
        }
      ]
    })

    if (!carts) {
      return res.status(404).json({ status: false, message: 'Cart not found.' })
    }

    let response = carts.map(item => {
      let result
      if (item?.booking?.status === 'Pending') {
        result = {
          id: item.id
        }
      } else if (item.status === 'Pending') {
        result = {
          id: item.id
        }
      }
      return result
    })

    response = response.filter(item => {
      if (item !== null) {
        return item
      }
    })
    let cart_count = response.length
    return res.json({
      status: true,
      message: 'Successful',
      data: {
        cartCount: cart_count
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification_id = req.params.notificationId
    const result = await notification.findOne({
      where: {
        id: notification_id,
        is_delete: {
          [db.Sequelize.Op.not]: true
        }
      }
    })
    if (!result) {
      return res.status(404).json({ status: false, message: 'Not found.' })
    }

    result.is_read = true
    await result.save()
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification_id = req.params.notificationId
    const result = await notification.findOne({
      where: {
        id: notification_id,
        is_delete: {
          [db.Sequelize.Op.not]: true
        }
      }
    })
    if (!result) {
      return res.status(404).json({ status: false, message: 'Not found.' })
    }
    result.is_delete = true
    await result.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.allNotificationToRead = async (req, res, next) => {
  const id = req.user.id
  const is_exist = await notification.findOne({
    where: {
      customer: id
    }
  })
  if (!is_exist) {
    return res
      .status(404)
      .json({ status: false, message: 'There is no notification.' })
  }
  await notification.update({ is_read: true }, { where: { customer: id } })

  return res.status(200).json({ status: true, message: 'Successful' })
}

exports.deleteAllNotification = async (req, res, next) => {
  try {
    const id = req.user.id
    const is_exist = await notification.findOne({
      where: {
        customer: id
      }
    })
    if (!is_exist) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no notification.' })
    }
    await notification.update({ is_delete: true, is_read: true}, { where: { customer: id } })

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteAccount = async (req, res, next) => {
  try {
    const reason = req.body.reason
    const userId = req.user.id
    const account = await Customer.findOne({
      where: {
        id: userId,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (!account) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong.' })
    }
    account.deleted = true
    account.delete_reason = reason
    const token = req.headers.authorization?.split(' ')[1]
    await blacklisted_token.create({ token })

    await account.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

const generateTimeSlot = (startTime, serviceTime) => {
  let timeSlot = []
  let StartTime = null
  let ServiceTime = parseInt(serviceTime)
  let keys = Object.keys(startTime)
  let totalIteration = Math.ceil(60 / ServiceTime)
  keys.forEach(startKey => {
    if (StartTime === null) {
      StartTime = new Date(`2022-01-13T0${startKey}`)
    }
    for (let i = 0; i < totalIteration; i++) {
      let appendValue = ''
      let tempStartTime = StartTime
      let StartHour = StartTime.getHours()
      let StartMinute = StartTime.getMinutes()
      StartHour = StartHour > 9 ? StartHour : `0${StartHour}`
      StartMinute = StartMinute > 9 ? StartMinute : `0${StartMinute}`
      appendValue += `${StartHour}:${StartMinute}`
      let endTime = tempStartTime.setMinutes(
        tempStartTime.getMinutes() + ServiceTime
      )
      let endHour = StartTime.getHours()
      let endMinute = StartTime.getMinutes()
      endHour = endHour > 9 ? endHour : `0${endHour}`
      endMinute = endMinute > 9 ? endMinute : `0${endMinute}`
      appendValue += ` - ${endHour}:${endMinute}`
      timeSlot.push(appendValue)
    }
  })
  let temp = []
  keys.forEach(it => {
    let [hour, minute] = it.split(':')
    temp.push(Number(hour))
  })
  timeSlot = timeSlot.filter(item => {
    let [startTime, endTime] = item.split('-')
    let [hour, minute] = endTime.split(':')
    hour = Number(hour)
    minute = Number(minute)
    if (!temp.includes(hour) && minute > Number(serviceTime)) return false
    return true
  })
  return timeSlot
}

exports.generateTimeSlot = async (req, res, next) => {
  try {
    const { startTime, completionTime } = req.body
    const result = generateTimeSlot(startTime, completionTime)

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}
