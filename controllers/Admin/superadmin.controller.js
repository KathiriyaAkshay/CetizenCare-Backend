const db = require('../../models')
const SuperAdmin = db.SuperAdmin
const Category = db.Category
const sub_category = db.sub_category
const Vendor = db.Vendor
const Customer = db.Customer
const vendor_service = db.vendor_service
const cart = db.cart
const booking = db.booking
const blacklisted_token = db.blacklisted_token
const refund_details = db.refund_details
const payment_details = db.payment_details
const booking_coupon_code = db.booking_coupon_code
const vendor_account_details = db.vendor_account_details

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  sendMobileVerificationCode
} = require('../../services/mobileService/mobileService')
const { accountVerified } = require('../../services/emailService/emailService')

// exports.register = async (req, res, next) => {
//   try {
//     const { username, password } = req.body
//     const admin = await SuperAdmin.findOne({ where: { username } })
//     if (admin) {
//       return res.status(200).json({
//         status: false,
//         message: 'account already exist.'
//       })
//     }

//     const hashedPassword = await bcrypt.hash(password, 10)

//     const user = await SuperAdmin.build({ username, password: hashedPassword })
//     await user.save()

//     return res.status(200).json({ status: true, message: 'Successful' }) //Succefully Registered.
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500
//     }
//     next(err)
//   }
// }

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body
    let user
    user = await SuperAdmin.findOne({ where: { username } })

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid credentials' })
    }

    const access_token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_SECRET,
      {
        expiresIn: '120d'
      }
    )
    const refresh_token = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '120d' }
    )
    user.refreshToken = refresh_token
    user.save()
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { access_token, refresh_token }
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body

  try {
    // Find user based on the provided refreshToken
    const user = await SuperAdmin.findOne({ where: { refreshToken } })

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid refresh token' })
    }

    // Generate new access and refresh tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_SECRET,
      { expiresIn: '1h' }
    )
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '10d' }
    )
    user.refreshToken = newRefreshToken
    await user.save()

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { accessToken, refreshToken: newRefreshToken }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong' })
  }
}

exports.createCategory = async (req, res, next) => {
  try {
    const { name, category_img, category_background_color, is_active } =
      req.body

    // Create a new category
    const category = await Category.create({
      name,
      category_img,
      category_background_color,
      create_by: req.user.id
    })

    if (is_active) {
      category.is_active = is_active
    }
    await category.save()
    return res
      .status(201)
      .json({ status: true, message: 'Successful'})
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: false, message: 'Failed to create a category' })
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
        'is_active',
        'createdAt',
        'updatedAt'
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

exports.allCategoriesWithAdmin = async (req, res, next) => {
  try {
    const categoriesWithAdmin = await Category.findAll({
      include: {
        model: SuperAdmin,
        as: 'superadmin'
      }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: categoriesWithAdmin })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch categories with admin details'
    })
  }
}

exports.createSubCategory = async (req, res, next) => {
  try {
    const { name, category_id, category_image, active } = req.body

    // Check if the SuperAdmin exists
    const admin = await SuperAdmin.findByPk(req.user.id)

    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: 'SuperAdmin not found.' })
    }

    const category = await Category.findByPk(category_id)

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: 'Category not found.' })
    }

    // Create the sub-category
    const newSubCategory = await sub_category.build({
      name,
      category: category.id,
      category_image,
      create_by: req.user.id
    })

    if (active) {
      newSubCategory.is_active = active
    }
    await newSubCategory.save()

    return res.status(200).json({
      status: true,
      message: 'Successful', //Sub-category created successfully.
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: false, message: 'Failed to create sub-category.' })
  }
}

exports.allSubCategories = async (req, res, next) => {
  try {
    // Use Sequelize association to include the SuperAdmin details
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const sub_categories = await sub_category.findAll()

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: sub_categories })
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch categories with admin details'
    })
  }
}

exports.allCategoriesWithSubCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: sub_category
          //   as: 'sub_category'
        }
      ]
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successfull', data: categories })
  } catch (error) {
    return res
      .status(500)
      .json({ status: true, message: 'Internal server error' })
  }
}

exports.getAllSubCategory = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage
    const sub_categories = await sub_category.findAll({
      attributes: ['id', 'name']
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: sub_categories })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch sub_categories details.'
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
      attributes: [
        'id',
        'name',
        'category',
        'category_image',
        'is_active',
        'createdAt',
        'updatedAt'
      ]
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: sub_categories })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch sub_categories details.'
    })
  }
}

exports.editCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId
  const { name, category_img, category_background_color, is_active } = req.body
  try {
    const category = await Category.findByPk(categoryId)

    if (!category) {
      const error = new Error('Category Not Found')
      error.statusCode = 404
      throw error
    }

    if (name) {
      category.name = name
    }
    if (category_img) category.category_img = category_img
    if (category_background_color)
      category.category_background_color = category_background_color
    if (is_active) category.is_active = is_active

    await category.save()

    return res.status(200).json({ status: true, message: 'Successful' }) //Category updated.
  } catch (err) {
    next(err)
  }
}

exports.editSubCategory = async (req, res) => {
  const sub_categoryId = req.params.subcategoryId
  const { name, category_img, is_active } = req.body
  try {
    const subcategory = await sub_category.findByPk(sub_categoryId)

    if (!subcategory) {
      const error = new Error('Sub Category Not Found')
      error.statusCode = 404
      throw error
    }

    if (name) {
      subcategory.name = name
    }
    if (category_img) subcategory.category_img = category_img
    if (is_active) subcategory.is_active = is_active

    await subcategory.save()

    return res.status(200).json({ status: true, message: 'Successful' }) //SubCategory updated.
  } catch (err) {
    next(err)
  }
}

exports.getCategoryById = async (req, res, next) => {
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

exports.getPendingVerifyAccounts = async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll({
      where: {
        proofRefVerified: false
      }
    })

    if (vendors.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'No pending accounts found' })
    }

    const result = vendors.filter(user => {
      return (
        user.mobileVerified &&
        user.password &&
        user.isDocumentUploaded &&
        user.criminalQnA
      )
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.vendorsAccountVerification = async (req, res, next) => {
  try {
    const { id, proofRefVerified } = req.body

    const user = await Vendor.findOne({
      where: {
        id
      }
    })

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: 'Vendor not found.' })
    }

    user.proofRefVerified = proofRefVerified
    await user.save()

    await accountVerified({
      email: user.email,
      subject: 'Account Verification successful'
    })
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    err.message = 'Something went wrong'
    next(err)
  }
}

exports.sendMessageToMobile = async (req, res, next) => {
  try {
    const mobileNumber = req.body.mobileNumber
    const message = req.body.message

    await sendMobileVerificationCode({
      mobileNumber,
      message
    })
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

exports.validateAdmin = async (req, res, next) => {
  try {
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.allVendor = async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll({
      attributes: [
        'id',
        'profile_img',
        'firstname',
        'middlename',
        'lastname',
        'dob',
        'email',
        'mobileNumber',
        'address1',
        'address2',
        'vendorId',
        'proofRef',
        'isDocumentUploaded',
        'proofRefVerified',
        'mobileVerified',
        'password',
        'criminalQnA',
        'emailVerified',
        'createdAt',
        'updatedAt'
      ]
    })
    if (!vendors) {
      return res
        .status(404)
        .json({ status: false, message: 'Details Not Available' })
    }

    const result = vendors.filter(user => {
      return (
        user.mobileVerified &&
        user.password &&
        user.isDocumentUploaded &&
        user.criminalQnA
      )
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.allCustomer = async (req, res, next) => {
  try {
    const customers = await Customer.findAll({
      attributes: [
        'id',
        'profile_img',
        'firstname',
        'middlename',
        'lastname',
        'dob',
        'email',
        'mobileNumber',
        'mobileVerified',
        'emailVerified',
        'address',
        'customerId',
        'createdAt',
        'updatedAt'
      ]
    })
    if (!customers) {
      return res
        .status(404)
        .json({ status: false, message: 'Details Not Available.' })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: customers })
  } catch (err) {
    next(err)
  }
}

exports.customerById = async (req, res, next) => {
  try {
    const user = req.query.customerId
    const customers = await Customer.findOne({
      where: {
        id: user
      },
      attributes: [
        'id',
        'profile_img',
        'firstname',
        'middlename',
        'lastname',
        'dob',
        'email',
        'mobileNumber',
        'mobileVerified',
        'emailVerified',
        'address',
        'customerId',
        'createdAt',
        'updatedAt'
      ]
    })
    if (!customers) {
      return res
        .status(404)
        .json({ status: false, message: 'Details Not Available.' })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: customers })
  } catch (err) {
    next(err)
  }
}

exports.vendorById = async (req, res, next) => {
  try {
    const user = req.query.vendorId
    const vendor = await Vendor.findOne({
      where: {
        id: user
      },
      attributes: [
        'id',
        'profile_img',
        'firstname',
        'middlename',
        'lastname',
        'dob',
        'email',
        'mobileNumber',
        'address1',
        'address2',
        'vendorId',
        'proofRef',
        'isDocumentUploaded',
        'proofRefVerified',
        'mobileVerified',
        'emailVerified',
        'createdAt',
        'updatedAt'
      ]
    })
    if (!vendor) {
      return res
        .status(404)
        .json({ status: false, message: 'Details Not Available.' })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: vendor })
  } catch (err) {
    next(err)
  }
}

exports.remainVendorPaying = async (req, res, next) => {
  try {
    let result = []
    await cart
      .findAll({
        where: {
          deleted: {
            [db.Sequelize.Op.not]: true
          }
        },
        attributes: ['vendor', 'price', 'quantity', 'round_off_price'],
        include: [
          {
            model: booking,
            where: {
              admin_pay: false,
              status: {
                [db.Sequelize.Op.in]: ['Successful', 'Vendor_Cancel']
              }
            },
            include: [
                {
                    model: booking_coupon_code,
                    attributes: ['create_by', 'percentage', 'maxAmount', 'maxDiscount']
                }
              ],
            attributes: ['id', 'tip', 'convenience_fee', 'bill_json']
          },
          {
            model: Vendor,
            as: 'cart_vendor',
            attributes: [
              'id',
              'firstname',
              'lastname',
              'mobileNumber',
              'email',
              'profile_img'
            ],
            include: [
              {
                model: vendor_account_details,
                attributes: [
                  'id',
                  'account_number',
                  'name',
                  'mobile_number',
                  'address',
                  'zip_code',
                  'bank_name',
                  'mode',
                  'routing_number'
                ]
              }
            ]
          }
        ]
      })
      .then(async cartData => {
        let vendors = []
        const reducedData = cartData.reduce((acc, curr) => {
          const vendorId = curr.vendor
          let price = parseFloat(curr?.booking.bill_json?.total_fare) 
                        // parseFloat(curr?.)

         if(curr?.booking?.booking_coupon_code && curr?.booking?.booking_coupon_code?.create_by === 'Admin'){
            const original_total_fare = price / (1 - (curr?.booking?.booking_coupon_code?.percentage / 100))

            // Step 2: Deduct 5% as other charges from the original total fare
            const other_charges_percentage = 5
            const deduction_amount = original_total_fare * (other_charges_percentage / 100)
            const final_fare = original_total_fare - deduction_amount
            price = final_fare
    
        }else {
            const other_charges_percentage = 5
            const deduction_amount = price * (other_charges_percentage / 100)
            const final_fare = price - deduction_amount
            price = final_fare
        }
          // If the vendor ID already exists in the accumulator, add the price to its total
          if (acc[vendorId]) {
            acc[vendorId].price += price
          } else {
            // Otherwise, create a new entry for the vendor ID
            acc[vendorId] = {
              vendor: vendorId,
              price: price,
              cart_vendor: curr.cart_vendor,
              booking_coupon_code: curr?.booking?.booking_coupon_code
            }
          }
          if (!vendors.includes(vendorId)) vendors.push(vendorId)
          return acc
        }, {})

        const details = Object.values(reducedData)
        const data = await cart.findAll({
          where: {
            vendor: {
              [db.Sequelize.Op.in]: vendors
            },
            deleted: {
              [db.Sequelize.Op.not]: true
            }
          },
          attributes: ['id', 'vendor', 'round_off_price'],
          include: [
            {
              model: booking,
              where: {
                admin_pay: true
              },
              include: [
                {
                    model: booking_coupon_code,
                    attributes: ['create_by', 'percentage', 'maxAmount', 'maxDiscount']
                }
              ],
              attributes: ['id', 'admin_pay', 'admin_pay_date']
            },
          ]
        })
        const filteredData = Object.values(
          data.reduce((acc, cur) => {
            const {
              vendor,
              booking: { admin_pay_date }
            } = cur
            if (
              !acc[vendor] ||
              new Date(admin_pay_date) >
                new Date(acc[vendor].booking.admin_pay_date)
            ) {
              acc[vendor] = cur
            }
            return acc
          }, {})
        )

        const mergedData = details.map(item => {
          const matchingItem = filteredData.find(
            lastDate => lastDate.vendor === item.vendor
          )
          let temp = {
            vendor: item?.vendor,
            price: item?.price,
            vendor_details: item?.cart_vendor?.dataValues,
            booking_detail: matchingItem?.booking?.dataValues,
            booking_coupon_codes: item?.booking?.booking_coupon_code,
            bank_details: item?.cart_vendor?.dataValues?.vendor_account_details
          }
          return temp
        })
        result = mergedData
      })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.getPaymentDetails = async (req, res, next) => {
  try {
    const vendorId = req.params.id
    const data = await cart.findAll({
      where: {
        vendor: vendorId,
        deleted: {
            [db.Sequelize.Op.not]: true
          }
      },
      attributes: ['id', 'quantity', 'round_off_price'],
      include: [
        {
          model: booking,
          where: {
            admin_pay: {
              [db.Sequelize.Op.not]: true
            },
            status: {
              [db.Sequelize.Op.in]: ['Successful', 'Vendor_Cancel']
            }
          },
          include: [
                {
                    model: booking_coupon_code,
                    attributes: ['create_by', 'percentage', 'maxAmount', 'maxDiscount']
                }
              ],
          attributes: ['bill_json', 'status', 'cancel_date', 'vendor_cancel_date', 'tip']
        },
        {
            model: vendor_service,
            attributes: ['id', 'images'],
            include: [
               { 
                model: sub_category,
                attributes: ['name']
               }

            ]
        }
      ]
    })
    const result = data.map((item) => {
        return {
            bill_json: item?.booking?.bill_json,
            name: item?.vendor_service?.sub_category?.name,
            quantity: item?.quantity,
            image: item?.vendor_service?.images,
            coupon: item?.booking?.booking_coupon_code,
            status: item?.booking?.status,
            customer_cancel_date: item?.booking?.cancel_date,
            vendor_cancel_date: item?.booking?.vendor_cancel_date,
            tip: item?.booking?.tip
        }
    })
    return res.status(200).json({ status: true, data: result })
  } catch (err) {
    next(err)
  }
}

exports.serviceRejectByVendor = async (req, res, next) => {
  try {
    const data = await cart.findAll({
      where: {
        status: 'Rejected'
      }
    })
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

exports.vendorPaidByAdmin = async (req, res, next) => {
  try {
    const id = req.params.id
    await booking.update(
      { admin_pay: true, admin_pay_date: new Date() },
      {
        where: {
          admin_pay: false,
          status: {
            [db.Sequelize.Op.in]: ['Successful', 'Vendor_Cancel']
          }
        },
        include: [
          {
            model: cart,
            where: {
              vendor: id
            }
          }
        ]
      }
    )
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.paidVendorById = async (req, res, next) => {
  try {
    const id = req.params.vendorId
    const details = await cart.findAll({
      where: {
        vendor: id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: [],
      include: [
        {
          model: booking,
          where: {
            admin_pay: true,
            status: {
              [db.Sequelize.Op.in]: ['Successful', 'Vendor_Cancel']
            }
          }
        },
        {
          model: vendor_service,
          include: [
            {
              model: Vendor
            }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: details })
  } catch (err) {
    next(err)
  }
}


exports.adminDetail = async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(400)
        .json({ status: false, message: 'Something went wrong' })
    }

    const user = {
      id: req.user.id,
      username: req.user.username,
    }

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { ...user }
    })
  } catch (err) {
    next(err)
  }
}

exports.allTransactions = async (req, res, next) => {
    try{
        const currentPage = req.query.page || 1
        const perPage = req.query.perPage || 10

        const offset = (currentPage - 1) * perPage

        const tdata = await cart.findAll({
            attributes: ['id'],
            include: [
                {
                    model: booking,
                    attributes: ['id', 'payment_status', 'status', 'bill_json', 'refund_date'],
                    where: {
                        payment_id: {
                            [db.Sequelize.Op.not]: null
                        }         
                    },
                    include: [
                        {
                            model: payment_details,
                            where: {
                                status: 'successful'
                            },
                            attributes: ['id', 'amount', 'status', 'method', 'trasaction_id', 'receipt_url', 'checkout_session', 'time']
                        },
                        {
                            model: refund_details,
                            attributes: ['id', 'refund_id', 'booking_id', 'transaction_id', 'charge_id', 'payment_intent_id', 'receipt_url', 'amount' , 'destination_details']
                        }
                    ]
                },
                {
                    model: Vendor,
                    as: 'cart_vendor',
                    attributes: ['id', 'firstname', 'middlename', 'lastname', 'profile_img', 'mobileNumber']
                },
                {
                    model: Customer,
                    as: 'cart_customer',
                    attributes: ['id', 'firstname', 'middlename', 'lastname', 'profile_img', 'mobileNumber']
                },
                {
                    model: vendor_service,
                    attributes: ['id'],
                    include: [
                        {
                            model: sub_category,
                            attributes: ['id', 'name', 'category_image']
                        }
                    ]
                },
               
            ],
        })  

        return res.status(200).json({status: true, message: 'Successful', data: tdata})
    }catch (err){
        next(err)
    }
}

exports.allRefunds = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 10

    const offset = (currentPage - 1) * perPage

    const tdata = await cart.findAll({
      attributes: ['id'],
      include: [
        {
          model: booking,
          attributes: [
            'id',
            'payment_status',
            'status',
            'bill_json',
            'refund_date'
          ],
          where: {
                refund: {
                  [db.Sequelize.Op.not]: null
                }
          },
          include: [
            {
              model: payment_details,
              where: {
                status: 'successful'
              },
              attributes: [
                'id',
                'amount',
                'status',
                'method',
                'trasaction_id',
                'receipt_url',
                'checkout_session',
                'time'
              ]
            },
            {
              model: refund_details,
              attributes: [
                'id',
                'refund_id',
                'booking_id',
                'transaction_id',
                'charge_id',
                'payment_intent_id',
                'receipt_url',
                'amount',
                'destination_details'
              ]
            }
          ]
        },
        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: [
            'id',
            'firstname',
            'middlename',
            'lastname',
            'profile_img',
            'mobileNumber'
          ]
        },
        {
          model: Customer,
          as: 'cart_customer',
          attributes: [
            'id',
            'firstname',
            'middlename',
            'lastname',
            'profile_img',
            'mobileNumber'
          ]
        },
        {
          model: vendor_service,
          attributes: ['id'],
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name', 'category_image']
            }
          ]
        }
      ],
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: tdata })
  } catch (err) {
    next(err)
  }
}


//Logout
exports.logout = async (req, res, next) => {
  try {
    const admin = await SuperAdmin.findOne({
      where: {
        id: req.user.id
      }
    })

    if (!admin) {
      return res.status(401).json({ status: false, message: 'Unauthorized' })
    }

    const token = req.headers.authorization?.split(' ')[1]
    await blacklisted_token.create({ token })

    admin.refreshToken = null
    await admin.save()

    res.status(200).json({ status: true, message: 'Successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: false, message: 'Internal server error' })
  }
}

