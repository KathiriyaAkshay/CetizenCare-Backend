const db = require('../../models')
// const AWS = require('aws-sdk');
const Sequelize = db.Sequelize
const sequelize = db.sequelize
const Customer = db.Customer
const booking_address = db.booking_address
const SecurityQnA = db.SecurityQnA
const cart = db.cart
const version = db.version
const booking = db.booking
const vendor_service = db.vendor_service
const vendor_postal_address = db.vendor_postal_address
const Vendor = db.Vendor
const customer_address = db.customer_address
const vendor_service_review = db.vendor_service_review
const customer_notification_settings = db.customer_notification_settings
const sub_category = db.sub_category
const Category = db.Category
const blacklisted_token = db.blacklisted_token
const calendar_booking_data = db.calendar_booking_data
const notification = db.notification
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  sendResetPaswordEmail,
  sendEmailVarification
} = require('../../services/emailService/emailService')
const {
  sendMobileVerificationCode,
  scheduleMessage
} = require('../../services/mobileService/mobileService')
const { addedToCart } = require('../../socket')
const device_notification_mapping = db.device_notification_mapping
const vendor_calendar_data = db.vendor_calendar_data
const terms_condition = db.terms_condition

exports.registerStep1 = async (req, res, next) => {
  try {
    let {
      firstname,
      middlename,
      lastname,
      dob,
      email,
      mobileNumber,
      address
    } = req.body

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(emailRegex.test(email))
    email = email.trim()
    else{
        return res.status(400).json({ status: false, message: 'Enter valid email' })

    }

    const mobileRegex = /^\+?[0-9]{8,15}$/
     if (mobileRegex.test(mobileNumber)) {
        // Remove leading and trailing spaces from the mobile number
        const trimmedMobileNumber = mobileNumber.trim();
        
        // Return the trimmed mobile number
        mobileNumber = trimmedMobileNumber
    } else {
        // Invalid mobile number format
        return res.status(400).json({ status: false, message: 'Enter valid mobile number' });
    }
    
    const alreadyAvailable = await Customer.findOne({
      where: {
        [Op.or]: [
          { mobileNumber },
          { email }
        ]
      }
    })

    if (alreadyAvailable?.deleted === true) {
      return res
        .status(404)
        .json({ status: false, message: 'Account is deleted' })
    }

    if (alreadyAvailable) {
      let message = ''
      if (!alreadyAvailable.mobileVerified) {
        message = 'Mobile Number is not Verified'
        // Generate and resend OTP here
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
        alreadyAvailable.mobileVerificationCode = otp
        alreadyAvailable.mobileVerificationExpiry = otpExpiry
        await alreadyAvailable.save()
        const otpMessage = `Your new verification code is ${otp} for registration at CetizenCare`
        await sendMobileVerificationCode({
          mobileNumber,
          message: otpMessage
        })
      } else if (!alreadyAvailable.securityQnA) {
        message = 'Security Answer is not set'
      } else if (!alreadyAvailable.password) {
        message = 'Password is not set'
      } else {
        message = 'Account already exists'
      }

      return res.status(200).json({
        status: false,
        message: message
      })
    }
    const isEmail = await Customer.findOne({
      where: {
        email
      }
    })

    if (isEmail) {
      return res.status(404).json({
        status: false,
        message: 'Account already exist for this email'
      })
    }

    // console.log(hashedPassword)

    const user = await Customer.build({
      firstname,
      lastname,
      email,
      mobileNumber,
      address,
      dob
    })
    if (middlename) user.middlename = middlename

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry
    const message = `Your verification code is ${otp} for registration at CetizenCare`

    await user.save()

    await sendMobileVerificationCode({
      mobileNumber,
      message
    })

    // res.status(201).json({
    //   status: true,
    //   message: "Email sent to your email id for otp verification." });

    return res.status(200).json({
      status: true,
      message: 'Successful' // OtpOtp is sent to your mobile number for otp verification.
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.emailVerificationOtp = async (req, res, next) => {
  try {
    const email = req.body.email

    const user = await Customer.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.emailVerificationOTP = otp
    user.emailVerificationExpiry = otpExpiry

    const message = `Your email verification otp is ${otp} for registration verification at CetizenCare`

    await sendEmailVarification({
      email,
      subject: 'Email verification for registration at CetizenCare',
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

exports.resendOtpToMobile = async (req, res, next) => {
  try {
    const mobileNumber = req.body.mobileNumber
    const user = await Customer.findOne({ where: { mobileNumber } })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry

    const message = `Your verification Code is ${otp} for registration at CetizenCare`

    await sendMobileVerificationCode({
      mobileNumber,
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

exports.verifyMobileNumber = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body
    const user = await Customer.findOne({ where: { mobileNumber } })

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
    user.mobileVerified = true
    user.mobileVerificationCode = null
    user.mobileVerificationExpiry = null
    await user.save()

    return res.status(200).json({ status: true, message: 'successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    const user = await Customer.findOne({ where: { email } })

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
    user.emailVerified = true
    user.emailVerificationOTP = null
    user.emailVerificationExpiry = null
    await user.save()

    return res.status(200).json({ status: true, message: 'successful' }) //Email verification successful.
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.registerStep2 = async (req, res, next) => {
  try {
    const { securityAns, mobileNumber } = req.body

    const customer = await Customer.findOne({ where: { mobileNumber } })
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: 'Vendor not found'
      })
    }

    if (customer) {
      const message = !customer.mobileVerified
        ? 'Mobile Number is not Verified'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    customer.securityQnA = securityAns
    await customer.save()
    return res.status(200).json({
      status: true,
      message: 'successful' //Security Q&A updated successfully
    })
  } catch (err) {
    next(err)
  }
}

exports.registerStep3 = async (req, res, next) => {
  try {
    const { customerId, password, mobileNumber, notificationId, device } =
      req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await Customer.findOne({ where: { mobileNumber } })
    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }
    user.password = hashedPassword
    user.customerId = customerId
    const access_token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_SECRET,
      {
        expiresIn: '30d'
      }
    )
    const refresh_token = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '60d' }
    )
    user.refreshToken = refresh_token

    // let device_modify = device === 'android' ? 'Android' : 'Ios'
    // const data = await device_notification_mapping.findOne({
    //   where: { notificationId: notificationId }
    // })
    // if (!data) {
    //   await device_notification_mapping.create({
    //     customer_id: user.id,
    //     type: 'Customer',
    //     device: device_modify,
    //     notificationId: notificationId
    //   })
    // }
    await user.save()

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { access_token, refresh_token }
    }) //Successfully Registered.
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

//Login Routes

exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body
    let user
    user = await Customer.findOne({
      where: {
        email
      }
    })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      })
    }
    if (user.deleted === true) {
      return res.status(404).json({
        status: false,
        message: 'Account is deleted'
      })
    }


    if (!user.emailVerified) {
      return res.status(404).json({
        status: false,
        message: 'Email not verified'
      })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : !user.password
        ? 'Password is not set'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid credentials' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.emailVerificationOTP = otp
    user.emailVerificationExpiry = otpExpiry
    const subject = `Your verification Code is ${otp} for Login at CetizenCare`

    await sendEmailVarification({
      email,
      subject,
      otp
    })
    await user.save()
    return res.status(200).json({
      status: true,
      message: 'Successful' //Otp is sent to your Email for otp verification.
    })

    // const access_token = jwt.sign({ userId: user.vid, role:user.role }, process.env.ACCESS_SECRET, { expiresIn: '1h' });
    // const refresh_token = jwt.sign({ userId: user.vid, role:user.role }, process.env.REFRESH_SECRET, { expiresIn: '10d' });
    // user.refreshToken = refresh_token;
    // user.save();
    // res.status(200).json({ access_token, refresh_token });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.loginEmailVerify = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    const user = await Customer.findOne({ where: { email } })

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
    user.emailVerified = true
    user.emailVerificationOTP = null
    user.emailVerificationExpiry = null

    const access_token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_SECRET,
      { expiresIn: '30d' }
    )
    const refresh_token = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '60d' }
    )
    user.refreshToken = refresh_token
    await user.save()
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { access_token, refresh_token }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.loginWithMobile = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body
    let user
    user = await Customer.findOne({
      where: {
        mobileNumber
      }
    })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      })
    }

    if (user && user.deleted === true) {
      return res.status(404).json({
        status: false,
        message: 'Account is deleted'
      })
    }

    if (!user.mobileVerified) {
      return res.status(404).json({
        status: false,
        message: 'MobileNumber not verified'
      })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : !user.password
        ? 'Password is not set'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid credentials' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry
    const message = `Your verification Code is ${otp} for Login at CetizenCare`

    await sendMobileVerificationCode({
      mobileNumber,
      message
    })
    await user.save()

    return res.status(200).json({
      status: true,
      message: 'Successful' //Otp is sent to your Mobile Number for otp verification.
    })

    // const access_token = jwt.sign({ userId: user.vid, role:user.role }, process.env.ACCESS_SECRET, { expiresIn: '1h' });
    // const refresh_token = jwt.sign({ userId: user.vid, role:user.role }, process.env.REFRESH_SECRET, { expiresIn: '10d' });
    // user.refreshToken = refresh_token;
    // user.save();
    // res.status(200).json({ access_token, refresh_token });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.loginMobileVerify = async (req, res, next) => {
  try {
    const { mobileNumber, otp, device, notificationId } = req.body
    const user = await Customer.findOne({ where: { mobileNumber } })
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }
    // const data = await device_notification_mapping.findOne({
    //   where: { notificationId: notificationId }
    // })
    // let device_modify = device === 'android' ? 'Android' : 'Ios'

    // if (!data) {
    //   await device_notification_mapping.create({
    //     customer_id: user.id,
    //     type: 'Customer',
    //     device: device_modify,
    //     notificationId: notificationId
    //   })
    // }

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
    user.emailVerified = true
    user.emailVerificationOTP = null
    user.emailVerificationExpiry = null

    const access_token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_SECRET,
      { expiresIn: '30d' }
    )
    const refresh_token = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '60d' }
    )
    user.refreshToken = refresh_token
    await user.save()
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { access_token, refresh_token }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

//Logout

exports.logout = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.user.id
      }
    })

    if (!customer) {
      return res.status(401).json({ status: false, message: 'Unauthorized' })
    }

    const token = req.headers.authorization?.split(' ')[1]
    await blacklisted_token.create({ token })

    customer.refreshToken = null
    await customer.save()

    res.status(200).json({ status: true, message: 'Successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: false, message: 'Internal server error' })
  }
}

//Forgot password
exports.forgotPasswordWithEmail = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await Customer.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : !user.password
        ? 'Password is not set'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.emailVerificationOTP = otp
    user.emailVerificationExpiry = otpExpiry

    const message = `${otp}`

    await sendEmailVarification({
      email,
      subject: 'Email verification for forgotPassword at CetizenCare',
      message
    })

    await user.save()

    return res.status(200).json({
      status: true,
      message: 'Successful' //Email sent to your email id for otp verification.
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: `Something went wrong : ${error}` })
  }
}

exports.forgotPasswordWithMobileNumber = async (req, res, next) => {
  const { mobileNumber } = req.body

  try {
    const user = await Customer.findOne({ where: { mobileNumber } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : !user.password
        ? 'Password is not set'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry
    const message = `Your verification Code is ${otp} for forgotPassword at CetizenCare`

    await sendMobileVerificationCode({
      mobileNumber,
      message
    })
    await user.save()

    return res.status(200).json({
      status: true,
      message: 'Successful' //Otp is sent to your mobile number for otp verification.'
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: `Something went wrong : ${error}` })
  }
}

//To Discuss first
exports.forgotPasswordWithSecurityQnA = async (req, res, next) => {
  try {
    const { mobileNumber, email } = req.body
    let user
    if (mobileNumber) {
      user = await Customer.findOne({ where: { mobileNumber } })
    } else if (email) {
      user = await Customer.findOne({ where: { email } })
    }
    if (!user) {
      return res.status(402).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : !user.securityQnA
        ? 'Security Answer is not set'
        : !user.password
        ? 'Password is not set'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    let question = user.securityQnA
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: question.question })
  } catch (err) {
    next(err)
  }
}

exports.verifySecurityQnA = async (req, res, next) => {
  try {
    const { mobileNumber, email, answer } = req.body
    let user
    if (mobileNumber) {
      user = await Customer.findOne({ where: { mobileNumber } })
    } else if (email) {
      user = await Customer.findOne({ where: { email } })
    }
    if (!user) {
      return res.status(402).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile Number is not Verified'
        : !user.securityQnA
        ? 'Security Answer is not set'
        : !user.password
        ? 'Password is not set'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    let ans = user.securityQnA.answer
    if (ans.toString() === answer.toString()) {
      return res.status(200).json({ status: true, message: 'Successfull' })
    } else {
      return res.status(400).json({ status: false, message: 'Invalid answer' })
    }
  } catch (err) {
    next(err)
  }
}

// Reset Password Routes

exports.resetPassword = async (req, res, next) => {
  const { mobileNumber, email } = req.body
  let user

  if (mobileNumber) {
    user = await Customer.findOne({ where: { mobileNumber } })
  } else if (email) {
    user = await Customer.findOne({ where: { email } })
  }
  if (!user) {
    return res.status(402).json({ status: false, message: 'User not found' })
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  user.password = hashedPassword
  user.save()

  return res
    .status(200)
    .json({ status: true, message: 'password reset successful' })
}

exports.getBookings = async (req, res, next) => {
  const id = req.user.id
  const currentPage = req.query.page || 1
  const perPage = req.query.perPage || 10

  const offset = (currentPage - 1) * perPage

  try {
    const bookings = await booking.findAll({
      where: {
        customer: id
      },
      order: [['updatedAt', 'DESC']]
    })
    if (!bookings) {
      return res
        .status(404)
        .json({ status: false, message: 'No Bookings Found' })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: bookings })
  } catch (err) {
    next(err)
  }
}

exports.createAddress = async (req, res, next) => {
  try {
    const {
      addressName,
      address1,
      address12,
      city,
      state,
      pincode,
      latitude,
      longitude,
      address_img
    } = req.body

    const address = await customer_address.build({
      addressName,
      customer: req.user.id,
      address1,
      address12,
      state,
      city,
      pincode
    })
    if (address_img) address.address_img = address_img
    if (latitude) address.latitude = latitude
    if (longitude) address.longitude = longitude

    await address.save()
    return res.status(200).json({
      status: true,
      message: 'Successful' //'Address Added Successfully'
    })
  } catch (err) {
    next(err)
  }
}

exports.editAddress = async (req, res, next) => {
  try {
    const addressId = req.params.addressId
    const updatedAddressData = req.body
    const address = await customer_address.findByPk(addressId)

    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: 'Customer address not found' })
    }

    // Update the customer address
    await address.update(updatedAddressData)
    await address.save()

    return res.status(200).json({ status: true, message: 'Successful' }) //Customer address updated successfully
  } catch (err) {
    next(err)
  }
}

exports.getAllAddress = async (req, res, next) => {
  try {
    const id = req.user.id
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    let address = await customer_address.findAll({
      where: { customer: id },
      attributes: [
        'id',
        'address1',
        'address12',
        'city',
        'state',
        'pincode',
        'addressName',
        'address_img'
      ],
      order: [['updatedAt', 'DESC']]
    })

    if (!address) {
      address = []
    }
    // if (!address) {
    //   return res.status(404).json({
    //     status: false,
    //     message: 'Address Not Found',
    //     data: []
    //   })
    // }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: address })
  } catch (error) {
    next(error)
  }
}

exports.getAddressById = async (req, res, next) => {
  try {
    const id = req.params.addressId
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const address = await customer_address.findOne({
      where: { id },
      attributes: [
        'id',
        'addressName',
        'address1',
        'address12',
        'city',
        'state',
        'pincode',
        'address_img'
      ]
    })

    if (!address) {
      return res.status(404).json({
        status: false,
        message: 'Address Not Found'
      })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: address })
  } catch (error) {
    next(error)
  }
}

exports.deleteAddress = async (req, res, next) => {
  const id = req.params.addressId
  try {
    const address = await customer_address.findOne({
      where: {
        id
      }
    })

    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no such address exist' })
    }
    try {
      await address.destroy({ where: { id } })
      return res.status(200).json({ status: true, message: 'Successful' })
    } catch (err) {
      err.message = "Address associated with service. Can't delete it"
      next(err)
    }
  } catch (err) {
    next(err)
  }
}

exports.editNotificationSettings = async (req, res, next) => {
  try {
    const notificationId = req.body.notificationId
    const updatednotificationData = req.body.settings
    const settings = await customer_notification_settings.findByPk(
      notificationId
    )

    //To do after discussion whether to put default settings here or at database creation
    if (!settings) {
      return res.status(404).json({
        message: 'Not Found'
      })
    }

    // Update the customer address
    await settings.update(updatednotificationData)

    return res.status(200).json({
      status: true,
      message: 'Successful' //Customer Notification settings are updated successfully.
    })
  } catch (err) {
    next(err)
  }
}

exports.showNotificationSettings = async (req, res, next) => {
  try {
    const id = req.user.id
    const settings = await customer_notification_settings.findOne({
      where: { customer: id },
      attributes: [
        'id',
        'enable_all',
        'news_letter_email',
        'promos_offers_email',
        'promos_offers_push',
        'promos_offers_whatsapp',
        'social_notification'
      ]
    })
    if (!settings) {
      const defaultSetting = await customer_notification_settings.build({
        enable_all: true,
        news_letter_email: true,
        promos_offers_email: true,
        promos_offers_push: true,
        promos_offers_whatsapp: true,
        social_notification: true,
        customer: req.user.id
      })
      await defaultSetting.save()
      return res.status(200).json({
        status: true,
        message: 'Successful',
        data: {
          enable_all: defaultSetting.enable_all,
          news_letter_email: defaultSetting.news_letter_email,
          promos_offers_email: defaultSetting.promos_offers_email,
          promos_offers_push: defaultSetting.promos_offers_push,
          promos_offers_whatsapp: defaultSetting.promos_offers_whatsapp,
          social_notification: defaultSetting.social_notification
        }
      })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: settings })
  } catch (err) {
    next(err)
  }
}

exports.showTermsAndCondition = async (req, res, next) => {
  try {
    const termsAndCondition = await terms_condition.findAll({
      where: {
        Person: 'Customer'
      }
    })
    if (!termsAndCondition) {
      return res
        .status(404)
        .json({ status: false, message: 'No terms and condition found' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: termsAndCondition })
  } catch (err) {
    next(err)
  }
}

exports.getAllCategory = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        'category_img',
        'category_background_color',
        'is_active'
      ],
      order: [['name', 'ASC']]
    })

    const updatedCategories = categories.map(obj => {
      return {
        id: obj.id,
        name: obj.name,
        category_img: obj.category_img,
        category_background_color: obj.category_background_color,
        is_active: obj.is_active,
        is_category: true
      }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: updatedCategories })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch categories details'
    })
  }
}

exports.getAllSubCategoryByCategory = async (req, res, next) => {
  const id = req.params.categoryId
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const sub_categories = await Category.findOne({
      attributes: ['id', 'name', 'category_background_color', 'create_by'],
      where: {
        id
      },
      include: {
        model: sub_category,
        attributes: ['id', 'name', 'category_image', 'is_active', 'create_by'],
        order: [['createdAt', 'DESC']]
      }
    })

    const updated_sub_categories = {
      id: sub_categories.id,
      name: sub_categories.name,
      category_background_color: sub_categories.category_background_color,
      create_by: sub_categories.create_by,
      sub_categories: sub_categories.sub_categories,
      is_category: false
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: updated_sub_categories
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch sub_categories details'
    })
  }
}

exports.getAllSubCategory = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage
    const sub_categories = await sub_category.findAll({
      attributes: ['id', 'name', 'category_image', 'is_active', 'create_by'],
      order: [['createdAt', 'DESC']]
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: sub_categories })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch sub_categories details'
    })
  }
}

// exports.getCategory = async (req, res, next) => {
//   try {
//     const categoryId = req.params.categoryId
//     const category = await Category.findByPk(categoryId, {
//       include: [
//         {
//           model: sub_category
//         }
//       ]
//     })

//     if (!category) {
//       return res
//         .status(400)
//         .json({ status: false, message: 'Category not found' })
//     }

//     return res
//       .status(200)
//       .json({ status: true, message: 'Successful', data: category })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({
//       status: false,
//       message: "Failed to fetch category with it's sub_category : " + error
//     })
//   }
// }

// exports.serviceFilter = async(req, res, next)=>{
//     try{

//         const { searchQuery, }

//     }catch(error){
//         next(error);
//     }
// }

exports.filterServices = async (req, res, next) => {
  try {
    const {
      searchQuery,
      minPrice,
      maxPrice,
      rating,
      maxDistance,
      userLatitude,
      userLongitude,
      serviceName
    } = req.query

    if (!minPrice) minPrice = 0

    const where = {}
    if (maxPrice) {
      where.price = {
        [Op.between]: [minPrice, maxPrice]
      }
    }

    if (rating) {
      where.rating = {
        [Op.lte]: rating
      }
    }

    if (!maxDistance) {
      maxDistance = 10
    }

    if (serviceName) {
      where.name = {
        [Op.iLike]: `%${serviceName}%`
      }
    }

    const filteredServices = await vendor_service.findAll({
      where,
      include: [
        // Include related models
        {
          model: vendor_postal_address,
          as: 'postal_vendor_service'
        }
      ]
    })

    // Calculate distances and filter by max distance
    const filteredServicesWithDistance = filteredServices.filter(service => {
      const serviceLatitude = service.postal_vendor_service.latitude
      const serviceLongitude = service.postal_vendor_service.longitude

      // Calculate distance between the user and the service using Haversine formula
      const earthRadius = 6371 // Radius of the Earth in kilometers
      const latDistance = (userLatitude - serviceLatitude) * (Math.PI / 180)
      const lonDistance = (userLongitude - serviceLongitude) * (Math.PI / 180)
      const a =
        Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
        Math.cos(userLatitude * (Math.PI / 180)) *
          Math.cos(serviceLatitude * (Math.PI / 180)) *
          Math.sin(lonDistance / 2) *
          Math.sin(lonDistance / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = earthRadius * c

      // Check if the service is within the user's specified max distance
      return distance <= maxDistance
    })

    // Send the filtered services as a JSON response
    return res.json({
      status: true,
      message: 'Successful',
      data: filteredServicesWithDistance
    })
  } catch (err) {
    next(err)
  }
}

exports.filterOnCategory = async (req, res, next) => {
  try {
    let { searchQuery } = req.query
    if (!searchQuery) {
      searchQuery = ''
    }

    const result = await sub_category.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: `%${searchQuery}%` // Case-insensitive ILIKE for searching
        }
      },
      order: [['updatedAt', 'DESC']]
    })

    if (!result) {
      return res.status(404).josn({ status: false, messatge: 'Not found' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.filterAllServices = async (req, res, next) => {
  try {
    let {
      searchQuery,
      price,
      rating = 0,
      maxDistance,
      userLatitude,
      userLongitude
    } = req.query

    // if (!minPrice) minPrice = 0

    const where = {}
    if (price) {
      where.price = price
    }

    if (rating) {
      where.rating = rating
    }

    if (!maxDistance) {
      maxDistance = 10
    }

    if (!searchQuery) {
      searchQuery = ''
    }

    where[Op.or] = [
      //   Sequelize.literal('"Category"."name" ILIKE :query'), // Search in Category table
      Sequelize.literal('"sub_category"."name" ILIKE :query') // Search in sub_category table
    ]

    const replacements = {
      query: `%${searchQuery}%`
    }

    where.on_leave = {
      [db.Sequelize.Op.not]: true
    }

    const filteredServices = await vendor_service.findAll({
      //   where,
      attributes: ['id', 'category', 'subcategory', 'price', 'rating'],
      include: [
        // Include related models: category and subcategory
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: sub_category,
          attributes: ['id', 'name', 'category_image', 'is_active', 'create_by']
        },
        {
          model: Vendor,
          attributes: ['id']
        },
        {
          model: vendor_postal_address,
          attributes: ['id', 'vendor', 'longitude', 'latitude', 'address_img']
        }
      ],
      where,
      replacements,
      distinct: true,
      order: [['updatedAt', 'DESC']]
    })

    let filteredServicesWithDistance
    if (userLatitude && userLongitude && filteredServices.length !== 0) {
      filteredServicesWithDistance = filteredServices.filter(service => {
        const vendorCoordinates = service.vendor_postal_address
        if (vendorCoordinates == null) return true
        const serviceLatitude = vendorCoordinates.latitude
        const serviceLongitude = vendorCoordinates.longitude

        // Calculate distance between the user and the service using Haversine formula
        const earthRadius = 6371 // Radius of the Earth in kilometers
        const latDistance = (userLatitude - serviceLatitude) * (Math.PI / 180)
        const lonDistance = (userLongitude - serviceLongitude) * (Math.PI / 180)
        const a =
          Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
          Math.cos(userLatitude * (Math.PI / 180)) *
            Math.cos(serviceLatitude * (Math.PI / 180)) *
            Math.sin(lonDistance / 2) *
            Math.sin(lonDistance / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = earthRadius * c

        return distance <= maxDistance
      })
    } else {
      filteredServicesWithDistance = filteredServices
    }

    let result = []
    if (filteredServicesWithDistance.length !== 0) {
      result = filteredServicesWithDistance.map(item => {
        return {
          service_id: item.id,
          sub_category_id: item.subcategory,
          name: item.sub_category.name,
          category_image: item.sub_category.category_image,
          is_active: item.sub_category.is_active,
          create_by: item.sub_category.create_by,
          is_category: false
        }
      })
    }

    // Send the filtered services as a JSON response
    return res.json({
      status: true,
      message: 'Successful',
      data: result
      //   data: filteredServices
    })
  } catch (err) {
    next(err)
  }
}

exports.professionalByFilter = async (req, res, next) => {
  try {
    let {
      sub_category_id,
      minPrice,
      maxPrice,
      rating,
      maxDistance,
      userLatitude,
      userLongitude
    } = req.query

    if (!minPrice) minPrice = 0

    if (!sub_category_id) {
      return res
        .status(404)
        .json({ status: false, message: 'Sub category must be selected' })
    }

    const where = {}
    if (maxPrice) {
      where.price = {
        [db.Sequelize.Op.between]: [minPrice, maxPrice]
      }
    }

    if (rating) {
      where.rating = {
        [db.Sequelize.Op.lte]: rating
      }
    }

    if (!maxDistance) {
      maxDistance = 10
    }

    if (sub_category_id) {
      where.subcategory = sub_category_id
    }

    where.on_leave = {
      [db.Sequelize.Op.not]: true
    }
    where.deleted = {
      [db.Sequelize.Op.not]: true
    }
    const filteredServices = await vendor_service.findAll({
      where,
      attributes: [
        'id',
        'category',
        'subcategory',
        'price',
        'rating',
        'experience',
        'previous_experience'
      ],
      include: [
        // Include related models: category and subcategory
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: sub_category,
          attributes: ['id', 'name']
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
          attributes: ['id', 'vendor', 'longitude', 'latitude', 'address_img']
        },
        {
          model: vendor_service_review,
          attributes: [
            [
              Sequelize.literal(`(
            SELECT ROUND(CAST(AVG(rating) AS numeric), 1)
            FROM vendor_service_reviews
            WHERE vendor_service_reviews.vendor = "Vendor"."id"
          )`),
              'average_rating'
            ],
            [
              Sequelize.literal(`(
            SELECT COUNT(id)
            FROM vendor_service_reviews
            WHERE vendor_service_reviews.vendor = "Vendor"."id"
          )`),
              'review_count'
            ]
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    })

    if (filteredServices.length === 0) {
      return res.json({
        status: true,
        message: 'Empty Data',
        data: []
        //   data: filteredServices
      })
    }
    // const filteredServices = await vendor_service.findAll({
    //   where,
    //   attributes: [
    //     'id',
    //     'category',
    //     'subcategory',
    //     'price',
    //     'rating',
    //     'experience',
    //     'previous_experience'
    //   ],
    //   include: [
    //     // Include related models: category and subcategory
    //     {
    //       model: Category,
    //       attributes: ['id', 'name']
    //     },
    //     {
    //       model: sub_category,
    //       attributes: ['id', 'name']
    //     },
    //     {
    //       model: Vendor,
    //       attributes: [
    //         'id',
    //         'firstname',
    //         'middlename',
    //         'lastname',
    //         'profile_img'
    //       ],
    //       include: [
    //         {
    //           model: vendor_postal_address,
    //           as: 'vendor_postal',
    //           attributes: ['id', 'vendor', 'longitude', 'latitude']
    //         }
    //       ]
    //     },
    //     {
    //       model: vendor_service_review,
    //       attributes: [
    //         [
    //           Sequelize.literal(
    //             `(SELECT ROUND(CAST(AVG(rating) AS numeric), 1) AS average_rating FROM vendor_service_reviews WHERE vendor_service_reviews.vendor = ${Sequelize.col(
    //               'vendor_service.Vendor.id'
    //             )})`
    //           ),
    //           'average_rating'
    //         ],
    //         [
    //           Sequelize.literal(
    //             `(SELECT COUNT(id) FROM vendor_service_reviews WHERE vendor_service_reviews.vendor = ${Sequelize.col(
    //               'vendor_service.Vendor.id'
    //             )})`
    //           ),
    //           'review_count'
    //         ]
    //       ]
    //     }
    //   ]
    // })
    let filteredServicesWithDistance

    if (userLatitude && userLongitude) {
      // console.log(filteredServices[0].Vendor)
      filteredServicesWithDistance = filteredServices.filter(service => {
        const vendorCoordinates = service.vendor_postal_address
        if (vendorCoordinates == null) return true
        const serviceLatitude = vendorCoordinates.latitude
        const serviceLongitude = vendorCoordinates.longitude

        // Calculate distance between the user and the service using Haversine formula
        const earthRadius = 6371 // Radius of the Earth in kilometers
        const latDistance = (userLatitude - serviceLatitude) * (Math.PI / 180)
        const lonDistance = (userLongitude - serviceLongitude) * (Math.PI / 180)
        const a =
          Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
          Math.cos(userLatitude * (Math.PI / 180)) *
            Math.cos(serviceLatitude * (Math.PI / 180)) *
            Math.sin(lonDistance / 2) *
            Math.sin(lonDistance / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = earthRadius * c

        return distance <= maxDistance
      })
    } else {
      filteredServicesWithDistance = filteredServices
    }

    let result = []

    if (filteredServicesWithDistance.length !== 0) {
      result = filteredServicesWithDistance.map(item => {
        return {
          sub_category_id: item.subcategory,
          vendor_id: item.Vendor.id,
          service_id: item.id,
          sub_category_name: item.sub_category.name,
          experience: item.experience,
          // is_active: item.sub_category.is_active,
          create_by: item.sub_category.create_by,
          firstname: item.Vendor.firstname,
          middlename: item.Vendor.middlename,
          lastname: item.Vendor.lastname,
          profile_img: item.Vendor.profile_img,
          rating:
            item.vendor_service_reviews[0]?.dataValues.average_rating ?? 0,
          reviews: item.vendor_service_reviews[0]?.dataValues.review_count ?? 0,
          price: item.price,
          is_category: false
        }
      })
    }
    result.sort((a, b) => b.rating - a.rating)
    // Send the filtered services as a JSON response
    return res.json({
      status: true,
      message: 'Successful',
      //   data: filteredServicesWithDistance
      data: result
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

// exports.getProfessionalByService = async (req, res, next) => {
//   try {
//     const { subCategoryId, maxDistance, longitude, latitude } = req.query

//     const vendors = await vendor_postal_address.findAll({
//       include: [
//         // Include related models: category and subcategory
//         {
//           model: vendor_service,
//           as: 'vendor_service_postal',
//           include: [
//             {
//               model: sub_category,
//               where: {
//                 id: subCategoryId
//               }
//             }
//           ]
//         }
//       ]
//     })

//     const filteredServicesWithDistance = vendors.filter(service => {
//       const serviceLatitude = service.latitude
//       const serviceLongitude = service.longitude

//       // Calculate distance between the user and the service using Haversine formula
//       const earthRadius = 6371 // Radius of the Earth in kilometers
//       const latDistance = (latitude - serviceLatitude) * (Math.PI / 180)
//       const lonDistance = (longitude - serviceLongitude) * (Math.PI / 180)
//       const a =
//         Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
//         Math.cos(latitude * (Math.PI / 180)) *
//           Math.cos(serviceLatitude * (Math.PI / 180)) *
//           Math.sin(lonDistance / 2) *
//           Math.sin(lonDistance / 2)
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//       const distance = earthRadius * c

//       // Check if the service is within the user's specified max distance
//       return distance <= maxDistance
//     })

//     // Send the filtered services as a JSON response
//     return res.json({
//       status: true,
//       message: 'Successful',
//       data: filteredServicesWithDistance
//     })
//   } catch (err) {
//     next(err)
//   }
// }

exports.getVendorById = async (req, res, next) => {
  const service_id = req.query.service_id
  try {
    const details = await vendor_service.findOne({
      where: {
        id: service_id
      },
      attributes: ['id', 'experience', 'description', 'price'],
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
          model: vendor_service_review,
          attributes: [
            [
              Sequelize.literal(
                `(SELECT ROUND(CAST(AVG(rating) AS numeric), 1) AS average_rating FROM vendor_service_reviews WHERE vendor_service_reviews.vendor = "Vendor"."id")`
              ),
              'average_rating'
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(id) FROM vendor_service_reviews WHERE vendor_service_reviews.vendor = "Vendor"."id")`
              ),
              'review_count'
            ],
            [
              Sequelize.literal(
                `(SELECT json_agg(json_build_object('comment', comment, 'rating', rating, 'time', time, 'customer', json_build_object('firstname', "Customer"."firstname", 'middlename', "Customer"."middlename", 'lastname', "Customer"."lastname", 'profile_img', "Customer"."profile_img")) ) FROM vendor_service_reviews INNER JOIN "Customers" AS "Customer" ON "vendor_service_reviews"."customer" = "Customer"."id" WHERE vendor_service_reviews.vendor = "Vendor"."id" GROUP BY vendor_service_reviews.vendor ORDER BY MAX("vendor_service_reviews"."createdAt") DESC LIMIT 10)`
              ),
              'comments'
            ]
          ]
        }
      ]
    })

    // console.log(details)
    // console.log(details.vendor_service_reviews[0].dataValues.average_rating)
    if (!details) {
      return res.status(404).json({
        status: true,
        message: 'Record not found'
      })
    }

    const result = {
      service_id: details.id,
      service_name: details.sub_category.name,
      profile_img: details.Vendor.profile_img,
      firstname: details.Vendor.firstname,
      middlename: details.Vendor.middlename,
      lastname: details.Vendor.lastname,
      price: details.price,
      rating: details.vendor_service_reviews[0]?.dataValues.average_rating ?? 0,
      reviews: details.vendor_service_reviews[0]?.dataValues.review_count ?? 0,
      experience: details.experience,
      about: details.description,
      review: details.vendor_service_reviews[0]?.dataValues.comments ?? []
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      //   data: details
      data: result
    })
  } catch (err) {
    next(err)
  }
}

// exports.uploadAtAws = async(req, res, next)=>{
//     try{

//         const s3 = new AWS.S3({
//             accessKeyId: process.env.AWS_ACCESS_ID,
//             secretAccessKey: process.env.AWS_SECRET_KEY
//         });

//         const params = {
//             Bucket: BUCKET_NAME,
//             CreateBucketConfiguration: {
//                 LocationConstraint : process.env.AWS_REGION
//             }
//         };

//         s3.createBucket(params, function(err, data){
//             if(err) console.log(err, err.stack);
//             else console.log('Bucket Created Successfully', data.Location);
//         })

//     }catch(err){
//         next(err);
//     }
// }

exports.getServiceById = async (req, res, next) => {
  const service_id = req.query.service_id
  try {
    const details = await vendor_service.findOne({
      where: {
        id: service_id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: [
        'id',
        'experience',
        'description',
        'rating',
        'price',
        'images',
        'included_details',
        'intervalMinutes',
        'service_json'
      ],
      include: [
        {
          model: sub_category,
          attributes: ['name']
        },
        {
          model: vendor_service_review,
          attributes: [
            [
              Sequelize.literal(
                `(SELECT ROUND(CAST(AVG(rating) AS numeric), 1) AS average_rating FROM vendor_service_reviews WHERE vendor_service_reviews.service = :service_id)`
              ),
              'average_rating'
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(id) FROM vendor_service_reviews WHERE vendor_service_reviews.service = :service_id)`
              ),
              'review_count'
            ],
            [
              Sequelize.literal(
                `(SELECT json_agg(json_build_object('comment', comment, 'rating', rating, 'time', time, 'customer', json_build_object('firstname', "Customer"."firstname", 'middlename', "Customer"."middlename", 'lastname', "Customer"."lastname", 'profile_img', "Customer"."profile_img")) ) FROM vendor_service_reviews INNER JOIN "Customers" AS "Customer" ON "vendor_service_reviews"."customer" = "Customer"."id" WHERE vendor_service_reviews.service = :service_id GROUP BY vendor_service_reviews.service ORDER BY MAX("vendor_service_reviews"."createdAt") DESC LIMIT 10)`
              ),
              'comments'
            ]
          ]
        }
      ],
      replacements: {
        service_id
      },
      order: [['updatedAt', 'DESC']]
    })

    if (!details) {
      return res.status(404).json({
        status: true,
        message: 'Record not found'
      })
    }

    const result = {
      service_id: details.id,
      service_name: details.sub_category.name,
      rating: details.rating,
      images: details.images,
      included_details: details.included_details,
      description: details.description,
      price: details.price,
      service_json: details.service_json,
      rating: details.vendor_service_reviews[0]?.dataValues.average_rating ?? 0,
      reviews: details.vendor_service_reviews[0]?.dataValues.review_count ?? 0,
      review: details.vendor_service_reviews[0]?.dataValues.comments ?? []
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      //   data: details
      data: result
    })
  } catch (err) {
    next(err)
  }
}

exports.getTimeSlot = async (req, res, next) => {
  try {
    const id = req.params.serviceId
    const service_details = await vendor_service.findOne({
      where: {
        id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      include: [
        {
          model: vendor_postal_address
        }
      ]
    })

    //TODO : handle leave time of service agent

    if (!service_details) {
      return res
        .status(404)
        .json({ status: false, message: 'Service not found' })
    }

    let timeslot = {}
    timeslot.slots = service_details.timeslot
    timeslot.on_leave = service_details.on_leave
    timeslot.service_location = service_details.service_location
    timeslot.address = service_details?.vendor_postal_address

    if (service_details.on_leave) {
      timeslot.leave_start_date = service_details.leave_start_date
      timeslot.leave_end_date = service_details.leave_end_date
    }

    if (service_details.service_location == 'office') {
      timeslot.addressId = service_details.address
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: timeslot })
  } catch (err) {
    next(err)
  }
}

// vendor id service id and date timeslot

exports.getAllTimeSlot = async (req, res, next) => {
  try {
    const { service_id, vendor_id } = req.query

    const data = await vendor_calendar_data.findAll({
      where: {
        service_id: service_id,
        vendor_id: vendor_id
      },
      attributes: ['time_slot']
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

exports.getBlockedTimeSlot = async (req, res, next) => {
  try {
    const { service_id, vendor_id, date } = req.query

    const data = await calendar_booking_data.findAll({
      where: {
        service_id: service_id,
        vendor_id: vendor_id,
        date: date,
        deleted: false
      },
      attributes: ['time_slot']
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

exports.getTimeSlotForService = async (req, res, next) => {
  try {
    const { vendor_id, service_id, time, date } = req.query
    let minutes = process.env.CART_TIME || 2
    const data = await vendor_calendar_data.findAll({
      where: {
        vendor_id: vendor_id,
        service_id: service_id
      },
      attributes: ['time_slot']
    })
    if (data.length === 0) {
      return res.status(200).json({ status: true, message: 'Successful', data: [] })
    }
    const timestamp = new Date(date).getTime() // Replace with your timestamp
    const datePart = getDatePart(timestamp)

    const data_for_compare = data.filter(item => {
      let [hour] = item?.time_slot?.split('-')
      let [hour1] = hour.split(':')
      let [hour2] = time?.split(':')
      if (Number(hour2) == Number(hour1)) return true
      else return false
    })

    let booking_data = await calendar_booking_data.findAll({
      where: {
        vendor_id: vendor_id,
        service_id: service_id,
        date: sequelize.literal(`DATE(date) = '${datePart}'`),
        deleted: {
          [db.Sequelize.Op.eq]: false
        }
        // payment_status: {
        //    [db.Sequelize.Op.eq]: true
        // }
      },
      attributes: [
        'time_slot',
        'date',
        'payment_status',
        'deleted',
        'createdAt'
      ]
    })
    booking_data = booking_data.filter(item => {
      //   console.log(item)
      const givenTime = new Date(item?.createdAt)
      const currentTime = new Date()
      const timeDifference = currentTime - givenTime
      const minutesDifference = timeDifference / (1000 * 60)
      if (minutesDifference < minutes || item?.payment_status == true)
        return true
      return false
    })
    let compare1 = data_for_compare.map(item => item.time_slot)
    let compare2 = booking_data.map(item => item.time_slot)
    const result = compare1.filter(item => {
      if (compare2.includes(item)) {
        return false
      }
      return true
    })

    const uniqueTemp = [...new Set(result)]

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: uniqueTemp })
  } catch (err) {
    next(err)
  }
}

function generateOrderID (length) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // Capital letters
  const digits = '0123456789' // Digits

  const randomLetters = Array.from(
    { length: 6 },
    () => letters[Math.floor(Math.random() * letters.length)]
  ).join('')
  const randomDigits = Array.from(
    { length: 6 },
    () => digits[Math.floor(Math.random() * digits.length)]
  ).join('')

  const orderID = randomLetters + randomDigits

  return orderID
}

function getDatePart (timestamp) {
  const dateObject = new Date(timestamp)
  const isoString = dateObject.toISOString()
  const datePart = isoString.split('T')[0]
  return datePart
}

exports.addTimeSlotToCart = async (req, res, next) => {
  try {
    let {
      vendor_id,
      address_id: addressId,
      service_id,
      description,
      time,
      date,
      price,
      quantity,
      service_location = 'office'
    } = req.body
    const id = req.user.id

    const currentDate = new Date()
    const cartDate = new Date(date)
    const hours = process.env.CART_TIME || 24
    // Check if the current date is not exceeding the date in the cart
    if (currentDate > cartDate) {
      return res.status(400).json({
        status: false,
        message: 'Invalid date selected'
      })
    }

    const service = await vendor_service.findOne({
      where: {
        id: service_id
      }
    })
    if (service?.deleted) {
      return res.status(400).json({
        status: false,
        message: "Service is deleted so you can't book"
      })
    }
    const address_field_vendor = [
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

    const address_field_customer = [
      'address1',
      'address12',
      'city',
      'state',
      'pincode',
      'addressName',
      'latitude',
      'longitude',
      'address_img'
    ]

    // time = JSON.stringify(time)
    const carts = await cart.build({
      vendor: vendor_id,
      customer: id,
      service: service_id,
      description,
      time,
      date,
      price,
      quantity
    })

    let booking_address_store
    if (addressId || service_location === 'office') {
      if (service_location === 'home') {
        address_data = await customer_address.findOne({
          where: {
            id: addressId
          },
          attributes: address_field_customer
        })
      } else {
        address_data = await vendor_postal_address.findOne({
          where: {
            id: service?.address
          },
          attributes: address_field_vendor
        })
      }
      booking_address_store = await booking_address.build(
        address_data.dataValues
      )

      await booking_address_store.save()
    }

    //TODO : handle leave time to check whether they are available or not

    // Generate a unique order ID with a length of 12 characters
    const uniqueOrderID = generateOrderID(12)

    carts.orderId = uniqueOrderID
    carts.address = booking_address_store?.id
    if (!carts) {
      return res
        .status(404)
        .json({ status: false, message: 'Cart not created' })
    }
    carts.status = 'Approved'
    let status = 'Pending'
    if (carts?.booking?.status === 'Reschedule') {
      status = 'Upcoming'
      const booking_data = await booking.findOne({
        where: {
          id: carts?.booking?.id
        }
      })
      booking_data.status = status
      booking_data.reschedule_status = 'approved'
      const calendar_data = await calendar_booking_data.findOne({
        where: {
          vendor_id: vendor_id,
          service_id: service_id,
          deleted: false
        }
      })
      calendar_data.time_slot = time
      calendar_data.date = date
      await calendar_data.save()

      await booking_data.save()
    } else {
      const booking_record = await booking.build({
        customer: id,
        status: status
      })

      carts.booking_id = booking_record.id
      booking_record.city = 'city'
      booking_record.pincode = 123456
      booking_record.addressName = 'addressName'
      const timestamp = new Date(date).getTime() // Replace with your timestamp
      const datePart = getDatePart(timestamp)
      const calendar_data1 = await calendar_booking_data.findOne({
        where: {
          vendor_id: vendor_id,
          service_id: service_id,
          date: sequelize.literal(`DATE(date) = '${datePart}'`),
          time_slot: time,
          deleted: false
        }
      })
      if (calendar_data1) {
        const givenTime = new Date(calendar_data1?.createdAt)
        const currentTime = new Date()
        const timeDifference = currentTime - givenTime
        const hoursDifference = timeDifference / (1000 * 60 * 60)
        if (hoursDifference > hours) {
          //   await calendar_data1.destroy()
          let cart_data = await cart.findOne({
            where: { calendar_id: calendar_data1?.id }
          })
          if (cart_data) {
            cart_data.deleted = true
            await cart_data.save()
          }
          calendar_data1.deleted = true
        } else {
          return res.status(400).json({
            status: false,
            message: 'This time slot is already allotted to someone'
          })
        }
      }
      const calendar_data = await calendar_booking_data.build({
        vendor_id: vendor_id,
        service_id: service_id,
        time_slot: time,
        date: date,
        deleted: false
      })
      carts.calendar_id = calendar_data.id
      await calendar_data.save()
      await booking_record.save()
    }

    await carts.save()

    addedToCart(req.io, {
      type: 'admin',
      message: 'Added to cart',
      id: vendor_id
    })

    const service_name = await vendor_service.findOne({
      where: {
        id: service_id
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: sub_category,
          attributes: ['id', 'name']
        }
      ]
    })

    const new_notification = await notification.build({
      person: 'Customer',
      customer: id,
      title: 'Service Added to Your Cart',
      description: `The service "${service_name?.sub_category?.name}" has been successfully added to your cart. Explore more or proceed to checkout for a seamless experience.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      cart_id: carts?.id,
      service_id: carts?.service
    })
    await new_notification.save()
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { cartID: carts?.id }
    })
  } catch (err) {
    next(err)
  }
}

exports.relatedService = async (req, res, next) => {
  try {
    // const serviceId = req.query.serviceId
    const vendorId = req.query.vendorId

    const customer = await vendor_service.findOne({
      where: {
        vendor: vendorId
      },
      attributes: ['subcategory', 'id']
    })

    if (!customer) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong' })
    }

    let services = []

    services = await vendor_service.findAll({
      where: {
        [db.Sequelize.Op.and]: [
          { subcategory: customer?.subcategory },
          { vendor: vendorId }
        ],
        is_active: {
          [Op.not]: false
        },
        deleted: {
          [Op.not]: true
        }
      },
      attributes: [
        'id',
        'description',
        'price',
        'is_active',
        'vendor',
        'price',
        'service_location',
        'images',
        'service_json'
      ],
      include: [
        {
          model: sub_category,
          attributes: ['name']
        }
      ],
      order: db.Sequelize.literal('RANDOM()'),
      limit: 6
    })

    if (services.length <= 6) {
      services = await vendor_service.findAll({
        where: {
          vendor: vendorId,
          is_active: {
            [db.Sequelize.Op.not]: false
          },
          deleted: {
            [db.Sequelize.Op.not]: true
          }
        },
        attributes: [
          'id',
          'description',
          'price',
          'is_active',
          'vendor',
          'price',
          'service_location',
          'images',
          'service_json'
        ],
        include: [
          {
            model: sub_category,
            attributes: ['name']
          }
        ],
        order: db.Sequelize.literal('RANDOM()'),
        limit: 6
      })
    }

    // if (services.length <= 6) {
    //   services = await vendor_service.findAll({
    //     where: {
    //       subcategory: customer?.subcategory,
    //       is_active: {
    //         [db.Sequelize.Op.not]: false
    //       },
    //       deleted: {
    //         [db.Sequelize.Op.not]: true
    //       }
    //     },
    //     attributes: ['id', 'description', 'price', 'is_active', 'vendor', 'price', 'service_location'],
    //     order: db.Sequelize.literal('RANDOM()'),
    //     limit: 6
    //   })
    // }
    // if (!services) {
    //   return res
    //     .status(404)
    //     .json({ status: false, message: 'Related service not found.' })
    // }

    if (services.length !== 0) {
      services = services.map(item => ({
        id: item?.id,
        description: item?.description,
        price: item?.price,
        is_active: item?.is_active,
        vendor: item?.vendor,
        price: item?.price,
        service_location: item?.service_location,
        images: item?.images,
        name: item?.sub_category?.name,
        service_json: item?.service_json
      }))
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: services })
  } catch (err) {
    next(err)
  }
}

exports.relatedServices = async (req, res, next) => {
  try {
    // const { userLatitude, userLongitude } = req.query

    // const result = await vendor_service.findAll({
    //   attributes: [
    //     'id',
    //     'category',
    //     'subcategory',
    //     'price',
    //     'rating',
    //     [
    //       Sequelize.fn('AVG', Sequelize.col('vendor_service_reviews.rating')),
    //       'avg_rating'
    //     ]
    //   ],
    //   include: [
    //     // Include related models: category and subcategory
    //     {
    //       model: sub_category,
    //       attributes: ['id', 'name', 'category_image', 'is_active', 'create_by']
    //     },
    //     {
    //       model: vendor_service_review,
    //       attributes: [],
    //       where: {
    //         service: Sequelize.col('vendor_service.id')
    //       },
    //       required: false
    //     },
    //     {
    //       model: Vendor,
    //       attributes: ['id']
    //     },
    //     {
    //       model: vendor_postal_address,
    //       attributes: ['id', 'vendor', 'longitude', 'latitude', 'address_img'],
    //       where: {
    //         [Op.not]: [{ latitude: null }, { longitude: null }]
    //       },
    //       required: false
    //     }
    //   ],
    //   where: {
    //     on_leave: {
    //       [Op.not]: true
    //     }
    //   },
    //   group: ['vendor_service.id'], // Group by service to get average rating
    //   order: [
    //     [Sequelize.literal('avg_rating DESC')],
    //     [
    //       Sequelize.literal(
    //         'ST_Distance_Sphere(point(longitude, latitude), point(?, ?))',
    //         'ASC'
    //       ),
    //       [userLongitude, userLatitude]
    //     ]
    //   ],
    //   limit: 6,
    //   subQuery: false // Disable subquery to allow ordering by average rating
    // })

    // const formattedResult = result.map(item => {
    //   return {
    //     service_id: item.id,
    //     sub_category_id: item.subcategory,
    //     name: item.sub_category.name,
    //     category_image: item.sub_category.category_image,
    //     is_active: item.sub_category.is_active,
    //     create_by: item.sub_category.create_by,
    //     is_category: false
    //     // Add other fields as needed
    //   }
    // })

    return res.json({
      status: true,
      message: 'Successful',
      data: formattedResult
    })
  } catch (err) {
    next(err)
  }
}

exports.topRattedService = async (req, res, next) => {
  try {
    const topRatedServices = await vendor_service_review.findAll({
      attributes: [
        'service',
        [db.sequelize.fn('avg', db.sequelize.col('rating')), 'rating']
      ],
      group: ['service'],
      order: [[db.sequelize.literal('rating'), 'DESC']]
    })

    // Extract service IDs from the result
    const topServiceIds = topRatedServices?.map(service => service?.service)

    // if (topServiceIds?.length === 0) {
    //   return res
    //     .status(200)
    //     .json({ status: true, message: 'Successful', data: [] })
    // }

    let serviceDetails = await vendor_service.findAll({
      attributes: [
        'id',
        'images',
        'price',
        'description',
        [
          db.sequelize.fn(
            'avg',
            db.sequelize.col('vendor_service_reviews.rating')
          ),
          'averageRating'
        ],
        [
          db.sequelize.fn(
            'count',
            db.sequelize.col('vendor_service_reviews.rating')
          ),
          'totalCount'
        ]
      ],
      where: {
        id: topServiceIds
      },
      include: [
        {
          model: vendor_service_review,
          attributes: [],
          required: false
        },
        {
          model: sub_category,
          attributes: ['id', 'name']
        },
        {
          model: Vendor,
          attributes: ['id']
        }
      ],
      group: ['vendor_service.id', 'sub_category.id', 'Vendor.id']
    })
    let result = []
    if (serviceDetails.length < 6) {
      let temp = await vendor_service.findAll({
        attributes: [
          'id',
          'images',
          'price',
          'description',
          [
            db.sequelize.fn(
              'avg',
              db.sequelize.col('vendor_service_reviews.rating')
            ),
            'averageRating'
          ],
          [
            db.sequelize.fn(
              'count',
              db.sequelize.col('vendor_service_reviews.rating')
            ),
            'totalCount'
          ]
        ],
        include: [
          {
            model: vendor_service_review,
            attributes: [],
            required: false
          },
          {
            model: sub_category,
            attributes: ['id', 'name']
          },
          {
            model: Vendor,
            attributes: ['id']
          }
        ],
        group: ['vendor_service.id', 'sub_category.id', 'Vendor.id']
      })
      serviceDetails = [...temp]
    }

    serviceDetails = serviceDetails.slice(0, 6)
    result = serviceDetails?.map(item => {
      return {
        service_image: item?.images,
        service_price: item?.price,
        service_name: item?.sub_category?.name,
        service_description: item?.description,
        service_average_rating: item?.dataValues?.averageRating,
        service_total_review_count: item?.dataValues?.totalCount,
        service_id: item?.id,
        vendor_id: item?.Vendor?.id
      }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Helper function to calculate distance
function calculateDistance (vendorCoordinates, userLatitude, userLongitude) {
  const serviceLatitude = vendorCoordinates.latitude
  const serviceLongitude = vendorCoordinates.longitude

  const earthRadius = 6371 // Radius of the Earth in kilometers
  const latDistance = (userLatitude - serviceLatitude) * (Math.PI / 180)
  const lonDistance = (userLongitude - serviceLongitude) * (Math.PI / 180)
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(userLatitude * (Math.PI / 180)) *
      Math.cos(serviceLatitude * (Math.PI / 180)) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

exports.customerDetails = async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(400)
        .json({ status: false, message: 'Something went wrong' })
    }

    const user = {
      id: req.user.customerId,
      firstname: req.user.firstname,
      middlename: req.user.middlename,
      lastname: req.user.lastname,
      profile_img: req.user.profile_img,
      address: req.user.address
    }

    const versions = await version.findAll({ where: { type: 'Customer' } })
    if (!versions) {
      return res
        .status(404)
        .json({ status: false, message: 'Something went wrong' })
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { ...user, version: versions }
    })
  } catch (err) {
    next(err)
  }
}
