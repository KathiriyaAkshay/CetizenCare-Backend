const db = require('../../models')
const Vendor = db.Vendor
const vendor_service = db.vendor_service
const SecurityQnA = db.SecurityQnA
const Vendor_Document = db.Vendor_Document
const vendor_account_details = db.vendor_account_details
const Category = db.Category
const sub_category = db.sub_category
const vendor_postal_address = db.vendor_postal_address
const vendor_service_review = db.vendor_service_review
const blacklisted_token = db.blacklisted_token
const terms_condition = db.terms_condition
const vendor_notification_settings = db.vendor_notification_settings
const Customer = db.Customer
const version = db.version
const device_notification_mapping = db.device_notification_mapping
const vendor_calendar_data = db.vendor_calendar_data
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const { Users } = require('../models/User');
const {
  sendEmailVarification
} = require('../../services/emailService/emailService')
const {
  sendMobileVerificationCode
} = require('../../services/mobileService/mobileService')

exports.registerStep0 = async (req, res, next) => {
  try {
    let {
      firstname,
      middlename,
      lastname,
      dob,
      email,
      mobileNumber,
      address1,
      address2,
      zipcode,
      working_address_zipcode,
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

    const alreadyAvailable = await Vendor.findOne({ 
        where: { mobileNumber },
        include: [
           {
               model: vendor_account_details
           }
        ]
     },
     )
    const isEmail = await Vendor.findOne({ where: { email } })

    if (alreadyAvailable?.deleted == true || isEmail?.deleted == true) {
      return res
        .status(404)
        .json({ status: false, message: 'Account is deleted' })
    }
    
    if (alreadyAvailable) {
        const message = !alreadyAvailable.mobileVerified
        ? 'Mobile number is not verified'
        : alreadyAvailable.password === null
        ? 'Password is not set'
        : alreadyAvailable.securityQnA === null
        ? 'Security QnA is remaining'
        : !alreadyAvailable.isDocumentUploaded
        ? 'Document is not uploaded'
        : alreadyAvailable?.vendor_account_details?.length === 0
        ? 'Bank account details are remaining'
        : !alreadyAvailable.criminalQnA
        ? 'Criminal QnA is remaining'
        : 'Account already exist'
        
        return res.json({
            status: false,
            message
        })
    }
    
        if (isEmail)
          return res.status(404).json({
            status: false,
            message: 'Account already exist for this email'
          })

    const user = await Vendor.build({
      firstname,
      lastname,
      dob,
      email,
      mobileNumber,
      address1,
      zipcode,
      working_address_zipcode
    })

    if (middlename) user.middlename = middlename
    if (address2) user.address2 = address2

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // OTP expires after 5 minutes
    user.mobileVerificationCode = otp
    user.mobileVerificationExpiry = otpExpiry
    const message = `Your verification code is ${otp} for registration at CetizenCare`

    await sendMobileVerificationCode({
      mobileNumber,
      message
    })

    await user.save()
    return res.status(200).json({
      status: true,
      message: 'Otp is sent to your mobile number for otp verification'
    })
  } catch (err) {
    next(err)
  }
}

exports.resendOtpToMobile = async (req, res, next) => {
  try {
    const mobileNumber = req.body.mobileNumber
    const user = await Vendor.findOne({ where: { mobileNumber } })

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
      message: 'Otp is sent to your mobile number for otp verification'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.registerStep1 = async (req, res, next) => {
  try {
    const { mobileNumber, vendorId, password } = req.body

    const user = await Vendor.findOne({
      where: {
        mobileNumber,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })
    if (!user) {
      return res.status(200).json({
        status: false,
        message: 'Account does not exist or complete first step for register'
      })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile number is not verified'
        : false

      if (message) {
        return res.json({
          status: false,
          message
        })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    user.password = hashedPassword
    user.vendorId = vendorId

    await user.save()
    res.status(201).json({
      status: true,
      message: 'VendorId and Password is set'
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

    const user = await Vendor.findOne({ where: { email } })
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
      message: 'Email sent to your email id for otp verification'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// exports.getMobileVerificationCode = async (req, res, next) => {
//   try {
//     const email = req.body.email;
//     const user = await Vendor.findOne({ where: { email } }, {
//       attributes: ['mobileVerificationCode', 'mobileVerificationExpiry']
//     });

//     if (user) {
//       const { mobileVerificationCode, mobileVerificationExpiry } = user;
//       res.status(200).json({
//         status: true,
//         message: { mobileVerificationCode, mobileVerificationExpiry }
//       })
//     } else {
//       res.status(400).json({
//         status: false,
//         message: "User not found."
//       })
//     }
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   }
// }

exports.verifyMobileNumber = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body
    const user = await Vendor.findOne({ where: { mobileNumber } })

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

    return res
      .status(200)
      .json({ status: true, message: 'Mobile verification successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.verifyEmail = async (req, res, next) => {
  try {
    const time = new Date()
    const { email, otp } = req.body
    const user = await Vendor.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    // Check if OTP matches and has not expired
    if (
      user.emailVerificationOTP !== otp ||
      user.emailVerificationExpiry < time
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

    return res
      .status(200)
      .json({ status: true, message: 'Email verification successful' })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

// exports.setMobileVerificationTrue = async(req, res, next)=>{
//   try{
//     const { isVerified , email }= req.body;
//     const vendor = await Vendor.findOne({where:{email}});
//     if(vendor){
//       vendor.mobileVerified = isVerified;
//       await vendor.save();
//       res.status(200).json({
//         status: true,
//         message: "Mobile verification status is set."
//       });
//     }else{
//       res.status(404).json({
//         status: false,
//         message: "Vendor Not Found."
//       })
//     }
//   }catch(err){
//     next(err);
//   }
// }

exports.registerStep2 = async (req, res, next) => {
  try {
    const { securityAns, mobileNumber } = req.body

    const vendor = await Vendor.findOne({ where: { mobileNumber } })
    if (!vendor) {
      return res.status(404).json({
        status: false,
        message: 'Vendor not found'
      })
    }
    if (vendor) {
      const message = !vendor.mobileVerified
        ? 'Mobile number is not verified'
        : vendor.password === null
        ? 'Password is not set'
        : false
      if (message) {
        return res.json({
          status: false,
          message
        })
      }
    }

    vendor.securityQnA = securityAns
    await vendor.save()
    return res.status(200).json({
      status: true,
      message: 'Security Q&A updated successfully'
    })
  } catch (err) {
    next(err)
  }
}

exports.registerStep3 = async (req, res, next) => {
  try {
    const { proofRef, mobileNumber } = req.body
    const vendor = await Vendor.findOne({ where: { mobileNumber } })

    if (!vendor) {
      res.status(404).json({
        status: false,
        message: 'Vendor not found'
      })
    }

    if (vendor) {
      const message = !vendor.mobileVerified
        ? 'Mobile number is not verified'
        : vendor.password === null
        ? 'Password is not set'
        : vendor.securityQnA === null
        ? 'Security QnA is remaining'
        : false
      if (message) {
        return res.json({
          status: false,
          message
        })
      }
    }

    vendor.proofRef = proofRef
    vendor.isDocumentUploaded = true
    vendor.profile_img = proofRef?.userprofileFrontImage
    await vendor.save()
    res.status(200).json({
      status: true,
      message: 'Successful' //Proof Reference updated successfully
    })
  } catch (err) {
    next(err)
  }
}

function validateRoutingNumber (routingNumber) {
  // Regular expression for routing number validation
  const routingRegex = /^[0-9]{9}$/

  // Check if the routing number matches the regular expression
  if (routingRegex.test(routingNumber)) {
    return true // Routing number is valid
  } else {
    return false // Routing number is invalid
  }
}


exports.registerStep03 = async (req, res, next) => {
          try {
            const {
              account_number,
              holder_name,
              mobileNumber,
              address,
              zip_code,
              bank_name,
              mobile_number,
              mode,
              routing_number
            } = req.body;

            if(!routing_number || !validateRoutingNumber(routing_number)){
                return res.status(400).json({status: false, message: "Add correct routing number"})
            }
            const vendor = await Vendor.findOne({ where: { mobileNumber } });
            
            if (!vendor) {
              res.status(404).json({
                status: false,
                message: "Vendor not found",
              });
            }
            if (vendor) {
              const message = !vendor.mobileVerified
                ? "Mobile number is not verified"
                : vendor.password === null
                ? "Password is not set"
                : vendor.securityQnA === null
                ? 'Security QnA is remaining'
                : vendor.proofRef === null
                ? "Documents Not Uploaded"
                : false;
              if (message) {
                return res.json({
                  status: false,
                  message,
                });
              }
            }

            const isPrimary = await vendor_account_details.findOne({
                where: {
                    vendor_id: vendor?.id,
                    mode: 'primary'
                }
            })

            if(isPrimary){
                return res.status(400).json({status: false, message: 'Account details already exist for this user'})
            }

            await vendor_account_details.create({
                vendor_id: vendor?.id,
                account_number,
                name: holder_name,
                mobile_number,
                address,
                zip_code,
                bank_name,
                mode,
                routing_number
            })

            await vendor.save();
            res.status(200).json({
              status: true,
              message: "Successful", 
            });
          } catch (err) {
            next(err);
          }
        };

exports.bankAccountDetails = async (req, res, next ) => {
    try{
        const id = req.user.id
        const data = await vendor_account_details.findAll({
            where: {
                vendor_id: id
            }
        })

        return res.status(200).json({status: true, message: "Successful", data: data})

    }catch(err){
        next(err)
    }
}

exports.addAccount = async (req, res, next) => {
    try{

        const id = req.user.id
        const {
              account_number,
              holder_name,
              address,
              zip_code,
              bank_name,
              mobile_number,
              mode,
              routing_number
            } = req.body;


             if(!routing_number || !validateRoutingNumber(routing_number)){
                return res.status(400).json({status: false, message: "Add correct routing number"})
            }

            const isAccount = await vendor_account_details.findOne({
                where: {account_number: account_number}
            })

            if(isAccount) return res.status(400).json({status: false, message: "Account already exist"})
            await vendor_account_details.create({
                vendor_id: id,
                account_number,
                name: holder_name,
                mobile_number,
                address,
                zip_code,
                bank_name,
                mode,
                routing_number
            })

        return res.status(200).json({status: true, message: "Successful"})
    }catch(err){
        next(err)
    }
}

exports.updateAccountDetails = async (req, res, next) => {
    try{
        const {
              account_number,
              holder_name,
              address,
              zip_code,
              bank_name,
              mobile_number,
              routing_number
            } = req.body;

         const data = await vendor_account_details.findOne({
            where: {
                account_number: account_number
            }
        })

         if(routing_number && !validateRoutingNumber(routing_number)){
                return res.status(400).json({status: false, message: "Add correct routing number"})
            }

        if(!data){
            return res.status(404).json({status: false, message: "Account details not found"})
        }

        if(account_number) data.account_number = account_number
        if(holder_name) data.name = holder_name
        if(mobile_number) data.mobile_number = mobile_number
        if(address) data.address = address
        if(zip_code) data.zip_code = zip_code
        if(bank_name) data.bank_name = bank_name
        if(routing_number) data.routing_number = routing_number
        await data.save();
        return res.status(200).json({status: true, message: "Successful"})

    }catch(err){
        next(err)
    }
}



exports.registerStep4 = async (req, res, next) => {
  try {
    const { criminalRecord, mobileNumber } = req.body

    const vendor = await Vendor.findOne({ where: { mobileNumber },
     include: [
           {
               model: vendor_account_details
           }
        ] })

    if (vendor) {
      const message = !vendor.mobileVerified
        ? 'Mobile number is not verified'
        : vendor.password === null
        ? 'Password is not set'
        : vendor.securityQnA === null
        ? 'Security QnA is remaining'
        : vendor.proofRef === null
        ? 'Documents Not Uploaded'
        : vendor?.vendor_account_details?.length === 0
        ? 'Bank account details are remaining'
        : false
      if (message) {
        return res.json({
          status: false,
          message
        })
      }
    }

    if (!vendor) {
      return res.status(404).json({
        status: false,
        message: 'Vendor not found'
      })
    }
    vendor.criminalQnA = criminalRecord
    await vendor.save()
    return res.status(200).json({
      status: true,
      message: 'Successful' //Criminal Record QnA updated successfully
    })
  } catch (err) {
    next(err)
  }
}

// Login Routes

exports.loginWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body
    let user
    user = await Vendor.findOne({
      where: {
        email
      },
       include: [
           {
               model: vendor_account_details
           }
        ]
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

    if (!user.emailVerified) {
      return res.status(404).json({
        status: false,
        message: 'Email not verified'
      })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile number is not verified'
        : user.password === null
        ? 'Password is not set'
        : user.securityQnA === null
        ? 'Security QnA is remaining'
        : !user.isDocumentUploaded
        ? 'Document is not uploaded'
        : user?.vendor_account_details?.length === 0
        ? 'Bank account details are remaining'
        : !user.criminalQnA
        ? 'Criminal QnA is remaining'
        : !user.proofRefVerified
        ? 'Account is not verified'
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
    // console.log(otp)
    const subject = `Your verification Code is ${otp} for Login at CetizenCare`

    await sendEmailVarification({
      email,
      subject,
      otp
    })
    await user.save()
    return res.status(200).json({
      status: true,
      message: 'Otp is sent to your Email for otp verification'
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
    const user = await Vendor.findOne({ where: { email } })

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

    const access_token = jwt.sign(
      { userId: user.vid, role: user.role },
      process.env.ACCESS_SECRET,
      { expiresIn: '30d' }
    )
    const refresh_token = jwt.sign(
      { userId: user.vid, role: user.role },
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

exports.loginWithMobile = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body
    let user
    user = await Vendor.findOne({
      where: {
        mobileNumber,
      },
       include: [
           {
               model: vendor_account_details
           }
        ]
    })

    if (user && user.deleted === true) {
      return res.status(404).json({
        status: false,
        message: 'Account is deleted'
      })
    }

    if (!user || !user.mobileVerified) {
      return res.status(404).json({
        status: false,
        message: 'User not found or mobileNumber not verified'
      })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile number is not verified'
        : user.password === null
        ? 'Password is not set'
        : user.securityQnA === null
        ? 'Security QnA is remaining'
        : !user.isDocumentUploaded
        ? 'Document is not uploaded'
        : user?.vendor_account_details?.length === 0
        ? 'Bank account details are remaining'
        : !user.criminalQnA
        ? 'Criminal QnA is remaining'
        : !user.proofRefVerified
        ? 'Account is not verified'
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
      message: 'Otp is sent to your Mobile Number for otp verification'
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
    const { mobileNumber, otp, notificationId, device } = req.body
    const user = await Vendor.findOne({ where: { mobileNumber } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    // const data = await device_notification_mapping.findOne({
    //   where: { notificationId: notificationId }
    // })
    // let device_modify = device === 'android' ? 'Android' : 'Ios'
    // if (!data) {
    //   await device_notification_mapping.create({
    //     vendor_id: user.id,
    //     type: 'Vendor',
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
    // console.log(error)
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

//Logout

exports.logout = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      where: {
        id: req.user.id
      }
    })

    if (!vendor) {
      return res.status(401).json({ status: false, message: 'Unauthorized' })
    }

    const token = req.headers.authorization?.split(' ')[1]
    await blacklisted_token.create({ token })

    vendor.refreshToken = null
    await vendor.save()

    res.status(200).json({ status: true, message: 'Successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: false, message: 'Internal server error' })
  }
}

//Forgot Password

exports.forgotPasswordWithEmail = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await Vendor.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile number is not verified'
        : user.password === null
        ? 'Password is not set'
        : !user.isDocumentUploaded
        ? 'Document is not uploaded'
        : !user.criminalQnA
        ? 'Criminal QnA is remaining'
        : false

      if (message) {
        return res.status(200).json({
          status: false,
          message: message
        })
      }
    }

    // Generate a reset password token
    // const resetPasswordToken = uuidv4();
    // const resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // Token expires after 30 minutes
    // user.resetPasswordToken = resetPasswordToken;
    // user.resetPasswordExpiry = resetPasswordExpiry;
    // await user.save();

    // Send the "forgot password" link to the user's email
    // const resetLink = `http://your-frontend-url/api/v1/reset-password?token=${resetPasswordToken}`;

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
      message: 'Successful'
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
    const user = await Vendor.findOne({ where: { mobileNumber } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile number is not verified'
        : user.password === null
        ? 'Password is not set'
        : !user.isDocumentUploaded
        ? 'Document is not uploaded'
        : !user.criminalQnA
        ? 'Criminal QnA is remaining'
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
    // console.log(otp)
    const message = `Your verification Code is ${otp} for forgotPassword at CetizenCare`

    await sendMobileVerificationCode({
      mobileNumber,
      message
    })
    await user.save()

    return res.status(200).json({
      status: true,
      message: 'Otp is sent to your mobile number for otp verification'
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: `Something went wrong : ${error}` })
  }
}

exports.forgotPasswordWithSecurityQnA = async (req, res, next) => {
  try {
    const { mobileNumber, email } = req.body
    let user
    if (mobileNumber) {
      user = await Vendor.findOne({ where: { mobileNumber } })
    } else if (email) {
      user = await Vendor.findOne({ where: { email } })
    }
    if (!user) {
      return res.status(402).json({ status: false, message: 'User not found' })
    }

    if (user) {
      const message = !user.mobileVerified
        ? 'Mobile number is not verified'
        : !user.securityQnA
        ? 'Security Answer is not set'
        : user.password === null
        ? 'Password is not set'
        : !user.isDocumentUploaded
        ? 'Document is not uploaded'
        : !user.criminalQnA
        ? 'Criminal QnA is remaining'
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
      user = await Vendor.findOne({ where: { mobileNumber } })
    } else if (email) {
      user = await Vendor.findOne({ where: { email } })
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

    let ans = user.securityQnA.answer ?? ''
    if (ans.toString() === answer.toString()) {
      return res.status(200).json({ status: true, message: 'Successful' })
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
    user = await Vendor.findOne({ where: { mobileNumber } })
  } else if (email) {
    user = await Vendor.findOne({ where: { email } })
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

exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body

  try {
    // Find user based on the provided refreshToken
    const user = await Vendor.findOne({ where: { refreshToken } })

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid refresh token' })
    }

    // Generate new access and refresh tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.ACCESS_SECRET,
      { expiresIn: '1h' }
    )
    const newRefreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.REFRESH_SECRET,
      { expiresIn: '10d' }
    )
    user.refreshToken = newRefreshToken
    await user.save()

    return res.status(200).json({
      status: true,
      message: { accessToken, refreshToken: newRefreshToken }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.getSecurityQnA = async (req, res, next) => {
  try {
    const securityQnA = await SecurityQnA.findAll({
      where: { option: 'security' },
      attributes: ['id', 'question', 'option']
    })
    if (securityQnA) {
      return res.status(200).json({
        status: true,
        message: securityQnA
      })
    } else {
      return res.status(400).json({
        status: false,
        message: 'Security questions Not Found.'
      })
    }
  } catch (err) {
    next(err)
  }
}

exports.getCriminalRecordQnA = async (req, res, next) => {
  try {
    const criminalQnA = await SecurityQnA.findAll({
      where: { option: 'criminal_record' },
      attributes: ['id', 'question', 'option']
    })
    if (criminalQnA) {
      return res.status(200).json({
        status: true,
        message: criminalQnA
      })
    } else {
      return res.status(400).json({
        status: false,
        message: 'Criminal Record questions not Found'
      })
    }
  } catch (err) {
    next(err)
  }
}

//is Verified

exports.isEmailVerified = async (req, res, next) => {
  const { email } = req.body

  const isVerified = await Vendor.findOne({
    where: { email },
    attributes: ['emailVerified']
  })

  if (!isVerified) {
    return res.json({
      status: false,
      message: 'Email is not verified or Account is not exist'
    })
  }

  return res.status(200).json({
    status: true,
    message: 'Email is verified.'
  })
}

exports.isMobileVerified = async (req, res, next) => {
  const { mobileNumber } = req.body

  const isVerified = await Vendor.findOne({
    where: { mobileNumber },
    attributes: ['mobileVerified']
  })

  if (!isVerified) {
    return res.json({
      status: false,
      message: 'Mobile Number is not verified or Account is not exist'
    })
  }

  return res.status(200).json({
    status: true,
    message: 'Mobile Number is verified'
  })
}

//Service API's
const getTimeSlot = (startTime, serviceTime) => {
  let timeSlot = []
  let StartTime = null
  let ServiceTime = parseInt(serviceTime)
  let keys = Object.keys(startTime)

  //total number of time slot which can be generate based on serviceTime in one hour
  let totalIteration = Math.ceil(60 / ServiceTime)

  keys.forEach(startKey => {
    //To check from where to start next time_slot and set startKey accordingly
    if (timeSlot.length !== 0) {
      let temp = timeSlot[timeSlot.length - 1].split('-')[1].trim()
      let [check1] = temp.split(':')
      let check2 = startKey.split(':')[0]
      if (Number(check2) == Number(check1)) {
        startKey = temp
      }
    }
    let checkStartKey = startKey.split(':')[0].trim()
    if(Number(checkStartKey)<=9 && checkStartKey[0]!=0){ startKey = `0${startKey}` }
    // console.log(startKey, '=======')
    StartTime = new Date(`2022-01-13T${startKey}`)

    //To generate all possible time slot as per the above calculation
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
    let [hour2, minute2] = endTime.split(':')
    let [hour1, minute1] = startTime.split(':')
    hour1 = Number(hour1)
    minute2 = Number(minute2)
    hour2 = Number(hour2)
    minute1 = Number(minute1)

    if (!temp.includes(hour2) && minute2 > Number(serviceTime)) return false
    else if (!temp.includes(hour1) && minute1 < Number(serviceTime))
      return false
    return true
  })
  return timeSlot
}

exports.addService = async (req, res, next) => {
  try {
    let {
      id, //subcategoryId instead of name as service would be from any existing subcategory
      price,
      experience,
      previous_experience,
      description,
      time_slot,
      is_active,
      images,
      included_details,
      service_location,
      on_leave,
      leave_start_date,
      leave_end_date,
      address,
      service_time,
      service_json
    } = req.body

    const newService = await vendor_service.build({
      subcategory: id,
      price,
      experience,
      previous_experience,
      description,
      timeslot: time_slot,
      images,
      rating: 0,
      address,
      intervalMinutes: service_time
    })
    // time_slot = JSON.stringify(time_slot)
    // time_slot = JSON.parse(time_slot)

    if (on_leave) {
      if (leave_start_date && leave_end_date) {
        newService.leave_start_date = leave_start_date
        newService.leave_end_date = leave_end_date
        newService.on_leave = on_leave
      } else {
        return res.status(404).json({
          status: false,
          message: 'Please Add leave Start Date and End Date'
        })
      }
    }
    if (is_active) newService.is_active = is_active
    if (included_details) newService.included_details = included_details
    if (service_location) newService.service_location = service_location
    if(service_json) newService.service_json = service_json
    newService.vendor = req.user.id

    const details = await sub_category.findOne({
      attributes: ['name', 'id', 'category'],
      where: {
        id
      }
    })

    if (!details) {
      return res
        .status(404)
        .json({ status: false, message: 'Service must be from sub_category' })
    }
    newService.category = details.dataValues.category

    // sort time_slot so that further only need to
    // check last element from array to check from where to start next element
    const sortedTimeSlot = Object.entries(time_slot)
      .sort((a, b) => {
        return Number(a[0].split(':')[0]) - Number(b[0].split(':')[0])
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})

    await newService.save()

    //generate time slot as per the service time duration of particular service
    const timeSlots = getTimeSlot(sortedTimeSlot, service_time)

    const rows = timeSlots.map(timeSlot => ({
      vendor_id: req.user.id,
      service_id: newService.id,
      time_slot: timeSlot,
      activate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    await vendor_calendar_data.bulkCreate(rows)

    return res.status(200).json({
      status: true,
      message: 'Successful'
    })
  } catch (err) {
    // console.log(err)
    return res.status(500).json({ status: false, message: err })
  }
}

function formatDate (date) {
  return [
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
    padTo2Digits(date.getDate())
  ].join('/')
}

exports.editService = async (req, res, next) => {
  const serviceId = req.params.serviceId
  let {
    price,
    experience,
    previous_experience,
    description,
    time_slot,
    is_active,
    images,
    service_location,
    on_leave,
    leave_start_date,
    leave_end_date,
    address,
    service_time,
    service_json
  } = req.body
  try {
    const service = await vendor_service.findOne({
      where: {
        id: serviceId,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (typeof on_leave === 'boolean') {
      if (on_leave && (!leave_start_date || !leave_end_date)) {
        return res.status(400).json({
          status: false,
          message: 'Please Add leave Start Date and End Date'
        })
      }

      //   TODO : check whether already any bookings are on this dates or not
      //   const bookings =

      service.leave_start_date = leave_start_date ? leave_start_date : null
      service.leave_end_date = leave_end_date ? leave_end_date : null
      service.on_leave = on_leave
    }

    if (!service) {
      const error = new Error('Service Not Found')
      error.statusCode = 404
      throw error
    }

    if (service.sub_category) {
      const details = await sub_category.findOne({
        attributes: ['id', 'category'],
        where: {
          id: service.sub_category
        }
      })

      if (!details) {
        return res.status(404).json({
          status: false,
          message: 'Service must be from sub_category'
        })
      }

      service.category = details.dataValues.category
      service.subcategory = details.dataValues.id
    }
    if (time_slot && service_time) {
      await vendor_calendar_data.destroy({
        where: {
          vendor_id: req.user.id,
          service_id: serviceId
        }
      })

      // sort time_slot so that further only need to
      // check last element from array to check from where to start next element
      const sortedTimeSlot = Object.entries(time_slot)
        .sort((a, b) => {
          return Number(a[0].split(':')[0]) - Number(b[0].split(':')[0])
        })
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})

      //generate time slot as per the service time duration of particular service
      const timeSlots = getTimeSlot(sortedTimeSlot, service_time)
      const rows = timeSlots.map(timeSlot => ({
        vendor_id: req.user.id,
        service_id: serviceId,
        time_slot: timeSlot,
        activate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      await vendor_calendar_data.bulkCreate(rows)
    }
    if (address) service.address = address
    if (is_active) service.is_active = is_active
    if (price) service.price = price
    if (experience) service.experience = experience
    if (previous_experience) service.previous_experience = previous_experience
    if (description) service.description = description
    if (time_slot) service.timeslot = time_slot
    if (images) service.images = images
    if (service_location) {
      service.service_location = service_location
      if (service_location == 'home') service.address = null
    }
    if (service_time) service.intervalMinutes = service_time
    if(service_json) service.service_json = { ...service?.service_json, ...service_json}
    await service.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getAllService = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage
    const services = await vendor_service.findAll({
      where: {
        id: req.user.id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (services) {
      return res
        .status(200)
        .json({ status: true, message: 'Successful', data: services })
    } else {
      return res
        .status(400)
        .json({ status: false, message: 'There is no records' })
    }
  } catch (err) {
    next(err)
  }
}

exports.getVendorServices = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage
    const services = await vendor_service.findAll({
      where: {
        vendor: req.user.id,
        deleted: {
          [db.Sequelize.Op.not]: true // This condition ensures deleted is not true
        }
      },
      attributes: [
        'id',
        'price',
        'experience',
        'previous_experience',
        'on_leave',
        'service_json'
      ],
      include: [
        {
          model: sub_category,
          attributes: ['name']
        },
        {
          model: Category,
          attributes: ['name']
        }
      ],
      order: [['updatedAt', 'DESC']]
    })

    if (services) {
      return res
        .status(200)
        .json({ status: true, message: 'Successful', data: services })
    } else {
      return res
        .status(400)
        .json({ status: false, message: 'There is no records' })
    }
  } catch (err) {
    next(err)
  }
}

exports.getServiceById = async (req, res, next) => {
  const serviceId = req.params.serviceId
  try {
    const service = await vendor_service.findOne({
      where: {
        id: serviceId,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: [
        'price',
        'experience',
        'previous_experience',
        'service_location',
        'description',
        'timeslot',
        'images',
        'on_leave',
        'leave_start_date',
        'leave_end_date',
        'intervalMinutes',
        'service_json'
      ],
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: sub_category,
          attributes: ['id', 'name']
        },
        {
          model: vendor_postal_address,
          attributes: [
            'id',
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
    })

    if (!service) {
      const error = new Error('Service Not Found')
      error.statusCode = 404
      throw error
    }

    if (service.deleted) {
      const error = new Error('Service is deleted')
      error.statusCode = 404
      throw error
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: service })
  } catch (err) {
    next(err)
  }
}

exports.deleteService = async (req, res, next) => {
  const service_id = req.params.serviceId
  try {
    const service_details = await vendor_service.findOne({
      where: {
        id: service_id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (!service_details) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no such Service' })
    }

    service_details.deleted = true
    await service_details.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

// Access Document's

// exports.getDLFront = async (req, res, next) => {
//   try {
//     const id = req.user.id
//     const document = await Vendor_Document.findOne({
//       where: { vendor_id: id },
//       attributes: ['dl_front']
//     })

//     if (!document) {
//       return res.status(404).json({
//         status: false,
//         message: "Vendor doesn't exist or not verified."
//       })
//     }

//     return res.status(200).json({ status: true, message: document })
//   } catch (error) {
//     return res.status(200).json({ status: false, message: error })
//   }
// }

// exports.getDLBack = async (req, res, next) => {
//   try {
//     const id = req.user.id
//     const document = await Vendor_Document.findOne({
//       where: { vendor_id: id },
//       attributes: ['dl_back']
//     })

//     if (!document) {
//       return res.status(404).json({
//         status: false,
//         message: "Vendor doesn't exist or not verified."
//       })
//     }

//     return res.status(200).json({ status: true, message: document })
//   } catch (error) {
//     next(error)
//   }
// }

// exports.getSSNImage = async (req, res, next) => {
//   try {
//     const id = req.user.id
//     const document = await Vendor_Document.findOne({
//       where: { vendor_id: id },
//       attributes: ['ssn_img']
//     })

//     if (!document) {
//       return res.status(404).json({
//         status: false,
//         message: "Vendor doesn't exist or not verified."
//       })
//     }

//     return res.status(200).json({ status: true, message: document })
//   } catch (error) {
//     next(error)
//   }
// }

// exports.getSLIImage = async (req, res, next) => {
//   try {
//     const id = req.user.id
//     const document = await Vendor_Document.findOne({
//       where: { vendor_id: id },
//       attributes: ['sli_img']
//     })

//     if (!document) {
//       return res.status(404).json({
//         status: false,
//         message: "Vendor doesn't exist or not verified."
//       })
//     }

//     return res.status(200).json({ status: true, message: document })
//   } catch (error) {
//     next(error)
//   }
// }

exports.createAddress = async (req, res, next) => {
  try {
    const {
      addressName,
      address1,
      address2,
      city,
      state,
      pincode,
      latitude,
      longitude,
      address_img
    } = req.body

    const address = await vendor_postal_address.build({
      addressName,
      vendor: req.user.id,
      address1,
      address2,
      city,
      state,
      pincode
    })

    if (address_img) address.address_img = address_img
    if (latitude) address.latitude = latitude
    if (longitude) address.longitude = longitude

    await address.save()
    return res.status(200).json({
      status: true,
      message: 'Successful'
    })
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

    const address = await vendor_postal_address.findAll({
      where: { vendor: id },
      attributes: [
        'id',
        'addressName',
        'address1',
        'address2',
        'city',
        'state',
        'pincode',
        'address_img'
      ],
      order: [['updatedAt', 'DESC']]
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

exports.getAddressById = async (req, res, next) => {
  try {
    const id = req.params.addressId
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const address = await vendor_postal_address.findOne({
      where: { id },
      attributes: [
        'id',
        'addressName',
        'address1',
        'address2',
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

exports.editAddress = async (req, res, next) => {
  const id = req.params.addressId
  try {
    const details = req.body
    const address = await vendor_postal_address.findOne({
      where: {
        id
      }
    })

    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: 'Address not found' })
    }

    await address.update(details)
    await address.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteAddress = async (req, res, next) => {
  const id = req.params.addressId
  try {
    const address = await vendor_postal_address.findOne({
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

exports.getAllReviews = async (req, res, next) => {
  try {
    const id = req.user.id
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const reviews = await vendor_service_review.findAll({
      where: { vendor: id },
      include: [
        {
          model: Customer,
          attributes: ['firstname', 'lastname', 'middlename']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    if (!reviews) {
      return res.status(404).json({
        status: false,
        message: 'Reviews Not Found'
      })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: reviews })
  } catch (error) {
    next(error)
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
      ]
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: categories })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch categories details'
    })
  }
}

exports.getAllSubCategory = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const sub_categories = await sub_category.findAll({
      attributes: ['id', 'name'],
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

exports.getAllSubCategoryByCategory = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10
    const id = req.params.categoryId
    const offset = (currentPage - 1) * perPage
    const sub_categories = await sub_category.findAll({
      where: {
        category: id
      },
      attributes: ['id', 'name', 'category', 'category_image', 'is_active'],
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

exports.getCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: sub_category
        }
      ]
    })

    if (!category) {
      return res
        .status(400)
        .json({ status: false, message: 'Category not found' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: category })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: "Failed to fetch category with it's sub_category : " + error
    })
  }
}

exports.vendorDetails = async (req, res, next) => {
  try {


      if (!req.user) {
        return res
          .status(400)
          .json({ status: false, message: 'Something went wrong' })
      }

    const user = {
      id: req.user.vendorId,
      firstname: req.user.firstname,
      middlename: req.user.middlename,
      lastname: req.user.lastname,
      profile_img: req.user.profile_img,
      verified: req.user.proofRefVerified,
      address1: req.user.address1,
      address2: req.user.address2
    }
    const versions = await version.findAll({ where: { type: 'Vendor' } })
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { ...user, versions }
    })
  } catch (err) {
    next(err)
  }
}

//settings api
exports.editNotificationSettings = async (req, res, next) => {
  try {
    const notificationId = req.body.notificationId
    const updatednotificationData = req.body.settings
    const settings = await vendor_notification_settings.findByPk(notificationId)

    //To do after discussion whether to put default settings here or at database creation

    if (!settings) {
      return res.status(404).json({
        status: false,
        message: 'Not Found' //Customer Notification settings are updated successfully.
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
    const settings = await vendor_notification_settings.findOne({
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
      const defaultSetting = await vendor_notification_settings.build({
        enable_all: true,
        news_letter_email: true,
        promos_offers_email: true,
        promos_offers_push: false,
        promos_offers_whatsapp: true,
        social_notification: false,
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
        Person: 'Vendor'
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
