const db = require('../../models')
const vendor_service_review = db.vendor_service_review
const booking = db.booking
const cart = db.cart
const payment_details = db.payment_details
const vendor_service = db.vendor_service
const Vendor = db.Vendor
const Customer = db.Customer
const sub_category = db.sub_category
const booking_address = db.booking_address
const booking_coupon_code = db.booking_coupon_code
const sequelize = db.sequelize
const Sequelize = db.Sequelize

exports.superApi = async (req, res, next) => {
  try {
    const id = req.user.id

    const avgRating = await vendor_service_review.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        vendor: id
      }
    })

    const totalSuccessfulBookings = await cart.count({
      where: {
        vendor: id, // Assuming you have a relationship between cart and Vendor
        status: 'Approved'
      },
      include: [
        {
          model: booking,
          where: {
            status: 'Successful'
          }
        }
      ]
    })

    const total = await cart.findAll({
      where: {
        vendor: id,
        status: 'Approved'
      },
      include: [
        {
          where: {
            status: 'Successful',
            payment_status: 'paid'
          },
          model: booking,
          include: [
            {
              model: payment_details,
              attributes: ['amount']
              //   where: {
              //     status: 'successful'
              //   }
            }
          ]
        }
      ]
    })
    const amountSum = total?.reduce((accumulator, item) => {
      let bookingAmount = parseFloat(
        item?.booking?.payment_detail?.dataValues?.amount
      )
    //   console.log(bookingAmount)
      bookingAmount = isNaN(bookingAmount) ? 0 : bookingAmount
      return accumulator + bookingAmount
    }, 0)

    const reviewCount = await vendor_service_review.count({
      where: {
        vendor: id
      }
    })

    const result = {
      average_rating: avgRating,
      total_successful_booking: totalSuccessfulBookings,
      total_amount: amountSum,
      review_count: reviewCount
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: result })
  } catch (err) {
    next(err)
  }
}

exports.averageRating = async (req, res, next) => {
  try {
    const id = req.user.id
    const avgRating = await vendor_service_review.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        vendor: id
      }
    })
    // if(!avgRating || avgRating === null){
    //     return res.status(404).json({status: false, message: "No rating"});
    // }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: avgRating })
  } catch (err) {
    next(err)
  }
}

exports.completedService = async (req, res, next) => {
  try {
    const id = req.user.id
    const totalSuccessfulBookings = await cart.count({
      where: {
        vendor: id, // Assuming you have a relationship between cart and Vendor
        status: 'Approved'
      },
      include: [
        {
          model: booking,
          where: {
            status: 'Successful'
          }
        }
      ],
    })

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: totalSuccessfulBookings
    })
  } catch (err) {
    next(err)
  }
}

exports.totalEarning = async (req, res, next) => {
  try {
    const id = req.user.id
    const total = await cart.findAll({
      where: {
        vendor: id,
        status: 'Approved'
      },
      include: [
        {
          where: {
            status: 'Successful',
            payment_status: 'paid'
          },

          model: booking,
          include: [
            {
              model: payment_details,
              attributes: ['amount']
              //   where: {
              //     status: 'successful'
              //   }
            }
          ]
        }
      ]
    })
    // const amountSum = total.reduce((accumulator, item) => {
    //   return accumulator + item.booking.payment_details[0].dataValues.amount
    // }, 0)
    let amountSum = 0

    total?.forEach(item => {
      let amount = item.booking?.dataValues.payment_detail?.dataValues.amount
      amount = isNaN(amount) ? 0 : amount
      amountSum += parseFloat(amount)
      //   const paymentDetails = item.booking.payment_details
      //   if (paymentDetails && paymentDetails.length > 0) {
      //     // Assuming each cart has only one payment_details entry
      //     amountSum += paymentDetails[0].dataValues.amount
      //   }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: amountSum })
  } catch (err) {
    next(err)
  }
}

exports.totalFeedback = async (req, res, next) => {
  try {
    const id = req.user.id
    const count = await vendor_service_review.count({
      where: {
        vendor: id
      }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: count })
  } catch (err) {
    next(err)
  }
}

exports.recentOrder = async (req, res, next) => {
  try {
    const id = req.user.id
    let orders = []
    orders = await cart.findAll({
      where: {
        vendor: id,
        status: 'Approved'
      },
      attributes: ['id', 'date', 'time'],
      include: [
        {
          model: Customer,
          as: 'cart_customer',
          attributes: [
            'id',
            'customerId',
            'firstname',
            'middlename',
            'lastname',
            'profile_img'
          ]
        },
        {
          model: booking,
          attributes: ['id', 'reschedule_count', 'reschedule_status'],
          where: {
            status: {
                [db.Sequelize.Op.in]:['Upcoming', 'Reschedule']}
          }
        },
        {
          model: vendor_service,
          attributes: ['service_location'],
          include: [
            {
              model: Vendor,
              attributes: ['id']
            },
            {
              model: sub_category,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    if (orders.length > 0) {
      orders = orders.map(item => {
        return {
          cart_id: item.id,
          service_name: item.vendor_service.sub_category.name,
          customer_detail: item.cart_customer,
          vendor_detail: item.vendor_service.Vendor,
          delivery_date: item.date,
          time: item?.time,
          service_location: item?.vendor_service?.service_location,
          reschedule_count: item?.booking?.reschedule_count,
          reschedule_status:item?.booking?.reschedule_status
        }
      })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: orders })
  } catch (err) {
    next(err)
  }
}

exports.serviceChart = async (req, res, next) => {
  try{
    const id = req?.user?.id 
    const totalSuccessfulBookings = await cart.count({
      where: {
        vendor: id, // Assuming you have a relationship between cart and Vendor
        status: 'Approved'
      },
      include: [
        {
          model: booking,
          where: {
            status: 'Successful'
          }
        }
      ],
    })

    const totalVendorCancel = await cart.count({
      where: {
        vendor: id, // Assuming you have a relationship between cart and Vendor
        status: 'Approved'
      },
      include: [
        {
          model: booking,
          where: {
            status: 'Vendor_Cancel'
          }
        }
      ],
    })

    const totalCustomerCancel = await cart.count({
      where: {
        vendor: id, // Assuming you have a relationship between cart and Vendor
        status: 'Approved'
      },
      include: [
        {
          model: booking,
          where: {
            status: 'Cancelled'
          }
        }
      ],
    })

    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: {totalSuccessfulBooking: totalSuccessfulBookings, totalVendorCancel: totalVendorCancel, totalCustomerCancel: totalCustomerCancel}
    })
  }catch(err){
    next(err)
  }
}

//calender apis
exports.calenderData = async (req, res, next) => {
  try {
    const id = req.user.id
    const month = req.body.month
    const year = req.body.year
    const startDate = new Date(`${year}-${month}-01`)
    // const startDate = new Date(`2023-09-01`)
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    )
    const state = [req.body.state]
    let booking_state = 'Approved'
    if (state.includes('Upcoming')) {
      state.push('Reschedule')
    }

    const serviceCounts = await cart.findAll({
      attributes: [
        [Sequelize.fn('date_trunc', 'day', Sequelize.col('cart.date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('cart.id')), 'count']
      ],
      where: {
        vendor: id,
        status: booking_state,
        date: {
          [Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: booking,
          attributes: [],
          where: {
            status: {
              [db.Sequelize.Op.or]: [...state]
            }
          }
        }
      ],
      group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('cart.date'))]
    })
    const formattedCounts = serviceCounts.reduce((acc, { dataValues }) => {
      const date = dataValues.date.getDate()
      const count = dataValues.count
      acc[date] = count
      return acc
    }, {})

    if (!formattedCounts) {
      return res.status(400).json({ status: false, message: 'No data found.' })
    }
    // Process the result to get it in the desired format
    // const formattedResult = result.map(item => ({
    //   date: item.getDataValue('date'),
    //   count: item.getDataValue('count')
    // }))

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: formattedCounts })
  } catch (err) {
    next(err)
  }
}

exports.getDataOnDate = async (req, res, next) => {
  try {
    const { date } = req.body
    const vendorId = req.user.id
    // Assuming date is in the format 'YYYY-MM-DD'
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1) // Add one day to get the next day
    const state = [req.body.state]
    let booking_state = 'Approved'
    if (state.includes('Upcoming')) {
      state.push('Reschedule')
    }

    const cartData = await cart.findAll({
      where: {
        vendor: vendorId,
        status: booking_state,
        date: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: ['id', 'orderId', 'date', 'time'],
      include: [
        {
          model: booking,
          where: {
            status: {
              [db.Sequelize.Op.or]: [...state]
            }
          }
        },
        {
          model: booking_address,
          attributes: [
            'address1',
            'address2',
            'city',
            'state',
            'pincode',
            'latitude',
            'longitude',
            'addressName'
          ]
        },

        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: ['id']
        },
        {
          model: Customer,
          as: 'cart_customer',
          attributes: [
            'customerId',
            'id',
            'firstname',
            'middlename',
            'lastname',
            'profile_img'
          ]
        },
        {
          model: vendor_service,
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name']
            }
          ],
          attributes: ['id', 'service_location']
        }
      ]
    })
    if (!cartData) {
      return res.status(404).json({ status: false, message: 'Data Not Found.' })
    }
    
    const result = cartData.map(item => {
      return {
        cartId: item?.id,
        service_name: item.vendor_service.sub_category.name,
        orderID: item.orderId,
        address: item?.booking_address,
        date: item.date,
        time: item.time,
        customerId: item.cart_customer,
        service_location: item.vendor_service.service_location,
        reschedule_count: item?.booking?.reschedule_count
      }
    })
    return res.status(200).json({
      status: true,
      message: 'Data fetched successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}


// exports.addCompletionTime = async (req, res, next) => {
//     try{
//         // const { intervalMinutes } = req.body
//         // const 
//     }catch(err){
//         next(err)
//     }
// }

exports.activateOneTimeSlot = async(req, res, next) => {
    try{
        const { vendor_id, service_id, date, time_slot} = req.body
        let data = await vendor_calendar_data.findOne({
            where: {
                service_id,
                vendor_id,
                time_slot
            }
        })

        data.activate = true;
        await data.save();
        return res.status(200).json({status: true, message: "Successful"})
    }catch(err){
        next(err)
    }
}

exports.activeMultipleTimeSlot = async(req, res, next) => {
    try{
        const { service_id, vendor_id, time_slots} = req.body
        await vendor_calendar_data.update({activate: true},{
            where: {
                time_slot: {[Sequelize.Op.in]: time_slots} ,
                vendor_id,
                service_id
            }
        })

        return res.status(200).json({status: true, message: "Successful"})
    }catch(err){
        next(err);
    }
}

exports.deActivateOneTimeSlot = async(req, res, next) => {
    try{
        const { vendor_id, service_id, time_slot} = req.body
        let data = await vendor_calendar_data.findOne({
            where: {
                service_id,
                vendor_id,
                time_slot
            }
        })

        data.activate = false;
        await data.save();
        return res.status(200).json({status: true, message: "Successful"})
    }catch(err){
        next(err)
    }
}

exports.deActiveMultipleTimeSlot = async(req, res, next) => {
    try{
        const { service_id, vendor_id, time_slots} = req.body
        await vendor_calendar_data.update({activate: false},{
            where: {
                time_slot: {[Sequelize.Op.in]: time_slots} ,
                vendor_id,
                service_id
            }
        })

        return res.status(200).json({status: true, message: "Successful"})
    }catch(err){
        next(err);
    }
}

exports.payHistory = async (req, res, next) => {
    try{
        const data = await cart.findAll({
            where: {
                vendor: req.user.id
            },
            attributes: ['id', 'date', 'price', 'quantity', 'time', 'round_off_price', 'orderId'],
            include: [
                {
                    model: booking,
                    attributes: ['id', 'admin_pay', 'admin_pay_date', 'bill_json', 'tip'],
                    where: {
                        admin_pay: true
                    },
                    include:[
                        {
                            model: booking_coupon_code,
                            attributes: ['id', 'percentage', 'maxAmount', 'maxDiscount', 'offer_code']
                        }
                    ]
                },
                {
                    model: vendor_service,
                    attributes: ['id', 'images'],
                    include: [
                        {
                            model: sub_category,
                            attributes: ['name', 'id']
                        }
                    ]
                }
                
            ]
        })

        return res.status(200).json({status:"true", message: "Successful", data: data})
    }catch(err){ 
        console.log(err)
        next(err)
    }
}