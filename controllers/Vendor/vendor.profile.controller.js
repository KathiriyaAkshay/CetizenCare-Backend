const db = require('../../models')
const Vendor = db.Vendor
const cart = db.cart
const {
  sendMobileVerificationCode
} = require('../../services/mobileService/mobileService')
const {
  sendEmailVarification
} = require('../../services/emailService/emailService')
const bcrypt = require('bcrypt')
const notification = db.notification

exports.getProfile = async (req, res, next) => {
  try {
    const id = req.user.id

    const details = await Vendor.findOne({
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
    const { firstname, middlename, lastname, dob } = req.body
    const details = await Vendor.findOne({
      where: { id }
    })

    if (req.body?.profile_img)
      return res
        .status(404)
        .json({ status: false, message: "Can't update your profile image" })

    if (!details) {
      return res
        .status(404)
        .json({ status: false, message: 'Profile is missing.' })
    }
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
    const user = await Vendor.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Sorry not able to recognize. try again'
      })
    }

    const isExist = await Vendor.findOne({
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

    if (user.mobileNumber === new_mobile) {
      return res.status(404).json({
        status: false,
        message: 'You can not enter same mobile number as current.'
      })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    // user.mobileNumber = new_mobile
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry
    // user.mobileVerified = false

    const message = `Your verification Code is ${otp} for update mobile number at CetizenCare`

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
    const user = await Vendor.findOne({ where: { id: req.user.id } })

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

    return res
      .status(200)
      .json({ status: true, message: 'Mobile verification successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.verifyEmailNumberForReset = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    const user = await Vendor.findOne({ where: { id: req.user.id } })

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

exports.sendOtpToEmail = async (req, res, next) => {
  try {
    const id = req.user.id
    const { new_email } = req.body

    const user = await Vendor.findOne({ where: { id } })
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    const isExist = await Vendor.findOne({
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

exports.updatePassword = async (req, res, next) => {
  const { current_password, new_password } = req.body
  try {
    const id = req.user.id
    const user = await Vendor.findOne({
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
    return res.status(200).json({ status: true, message: 'Successful.' })
  } catch (err) {
    next(err)
  }
}

exports.getNotification = async (req, res, next) => {
  try {
    const result = await notification.findAll({
      where: {
        vendor: req.user.id,
        is_delete: {
          [db.Sequelize.Op.not]: true
        }
      },
      createdAt: {
        [db.Sequelize.Op.between]: [
          new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
          new Date()
        ]
      }
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
    const id = req.user.id
    const notification_count = await notification.count({
      where: {
        vendor: id,
        is_read: false,
        createdAt: {
          [db.Sequelize.Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const cart_count = await cart.count({
      where: {
        vendor: id,
        deleted: {
          [db.Sequelize.Op.not]: true
        },
        status: {
          [db.Sequelize.Op.in]: ['Pending', 'Approved']
        }
      }
    })

    return res.json({
      status: true,
      message: 'Successful',
      data: {
        cart_count: cart_count,
        notification_count: notification_count
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
      vendor: id
    }
  })
  if (!is_exist) {
    return res
      .status(404)
      .json({ status: false, message: 'There is no notification.' })
  }
  await notification.update({ is_read: true }, { where: { vendor: id } })

  return res.status(200).json({ status: true, message: 'Successful' })
}

exports.deleteAllNotification = async (req, res, next) => {
  try {
    const id = req.user.id
    const is_exist = await notification.findOne({
      where: {
        vendor: id
      }
    })
    if (!is_exist) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no notification.' })
    }
    await notification.update({ is_delete: true, is_read: true }, { where: { vendor: id } })

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteAccount = async (req, res, next) => {
  try {
    const reason = req.body.reason
    const userId = req.user.id
    const account = await Vendor.findOne({
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
    await account.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}


