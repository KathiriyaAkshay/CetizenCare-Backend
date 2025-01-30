const db = require('../../models')
const Customer = db.Customer
const vendor_service_review = db.vendor_service_review
const vendor_service = db.vendor_service
const sub_category = db.sub_category
const notification = db.notification
const vendor_coupon = db.vendor_coupon
const admin_coupon = db.admin_coupon
const cart = db.cart
require('dotenv').config()

exports.addReview = async (req, res, next) => {
  try {
    const { rating, serviceId, review, images, vendorId } = req.body
    const customerId = req.user.id

    const isReview = await vendor_service_review.findOne({
      where: {
        customer: customerId,
        service: serviceId
      },
      attributes: ['id', 'rating', 'comment', 'updatedAt', 'images'],
      include: [
        {
          model: vendor_service,
          attributes: ['id', 'images'],
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    })

    if(isReview){
        return res.status(200).json({status: false, message: "Review and Rating already given"})
    }

    const review_rating = await vendor_service_review.build({
      service: serviceId,
      rating: rating,
      comment: review,
      images: images,
      customer: customerId,
      vendor: vendorId
    })

    const service_name = await vendor_service.findOne({
      where: { id: serviceId },
      include: [
        {
          model: sub_category,
          attributes: ['name']
        }
      ]
    })
    if (!review_rating) {
      return res.status(400).json({
        status: false,
        message: 'Something went wrong, please try again'
      })
    }

    const new_notification = await notification.build({
      person: 'Vendor',
      vendor: vendorId,
      title: 'Review added',
      description: `Review added successfully for ${service_name?.sub_category?.name}.`,
      timestamp: Date.now(),
      is_read: false,
      is_delete: false,
      service_id: serviceId,
      cart_id: null
    })

    await review_rating.save()
    await new_notification.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getMyReviews = async (req, res, next) => {
  try {
    const user = req.user.id
    const reviews = await vendor_service_review.findAll({
      where: {
        customer: user
      },
      attributes: ['id', 'rating', 'comment', 'updatedAt'],
      include: [
        {
          model: vendor_service,
          attributes: ['id', 'images'],
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    if (!reviews) {
      return res
        .status(404)
        .json({ status: false, message: "Review and Rating's not found." })
    }

    let data = []
    if (reviews?.length > 0) {
      data = reviews.map(item => {
        return {
          id: item.id,
          rating: item.rating,
          comment: item.comment,
          time: item.updatedAt,
          images: item.vendor_service.images,
          service: item.vendor_service.sub_category.name
        }
      })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

// exports.getAllReviews = async (req, res, next) => {
//   try {
//     const id = req.user.id
//     const currentPage = req.query.page || 1
//     const perPage = req.query.perPage || 10

//     const offset = (currentPage - 1) * perPage

//     const reviews = await vendor_service_review.findAll({
//       where: { customer: id },
//       limit: perPage,
//       offset
//     })

//     if (!reviews) {
//       return res.status(404).json({
//         status: false,
//         message: 'Reviews Not Found.'
//       })
//     }

//     return res
//       .status(200)
//       .json({ status: true, message: 'Successful', data: reviews })
//   } catch (error) {
//     next(error)
//   }
// }

exports.getReviewById = async (req, res, next) => {
  try {
    const user = req.user.id
    const serviceId = req.query.serviceId
    const review = await vendor_service_review.findOne({
      where: {
        customer: user,
        service: serviceId
      },
      attributes: ['id', 'rating', 'comment', 'updatedAt', 'images'],
      include: [
        {
          model: vendor_service,
          attributes: ['id', 'images'],
          include: [
            {
              model: sub_category,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    })

    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: 'Review and Rating not found.' })
    }

    let data = {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      time: review.updatedAt,
      images: review.images,
      service: review.vendor_service.sub_category.name
    }
    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}

exports.editReview = async (req, res, next) => {
  try {
    const user = req.user.id
    const { serviceId, rating, comment, time, images } = req.body

    const review = await vendor_service_review.findOne({
      where: {
        customer: user,
        service: serviceId
      }
    })

    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: 'Review and Rating not found.' })
    }

    if (rating) review.rating = rating
    if (comment) review.comment = comment
    if (time) review.time = time
    if (images) review.images = images
    await review.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getCoupons = async (req, res, next) => {
  try {
      // is gather vendor_id from  carts table based on customer_id(if there is any row in cart for this customer basically previous purchases)
      // based on those vendor_id will get coupons from vendor_coupon by checking it's expiry date
    const cart_data = await cart.findAll({
      where: {
        customer: req.user.id
      },
      attributes: ['vendor', 'service']
    })

    let vendor_ids = cart_data.map(item => {
      return item?.vendor
    })
    let vendor_service_coupon = await vendor_coupon.findAll({
      where: {
        vendor_id: {
          [db.Sequelize.Op.in]: [...vendor_ids]
        }
      },
      order: [['createdAt', 'desc']],
      limit: 6
    })

    vendor_service_coupon = vendor_service_coupon.filter(item => {
      const comp1 = new Date(item?.endDate)
      const comp2 = new Date()
      if (comp1 > comp2) return true
      else return false
    })

    // let service_ids = cart_data.map(item => {
    //   return item?.service
    // })
    // const services_coupon = await vendor_coupon

    return res
      .status(200)
      .json({
        status: true,
        message: 'Successful',
        data: vendor_service_coupon
      })
  } catch (err) {
    next(err)
  }
}

exports.getCouponByCode = async (req, res, next) => {
  try {
    const code = req.params.code
    const data = await vendor_coupon.findOne({
      where: {
        offer_code: code
      }
      // attributes: ['id', 'offer_name', 'offer_type', 'percentage', 'offer_code', 'description', 'image', 'bg_color', 'vendor_id']
    })
    if (data)
      return res
        .status(200)
        .json({ status: true, message: 'Successful', data: data })

    const data1 = await admin_coupon.findOne({
      where: {
        offer_code: code
      }
    })

    if (data1)
      return res
        .status(200)
        .json({ status: true, message: 'Successful', data: data1 })

    return res.status(404).json({ status: false, message: 'Not found' })
  } catch (err) {
    next(err)
  }
}
