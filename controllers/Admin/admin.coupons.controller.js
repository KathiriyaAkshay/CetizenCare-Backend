const db = require('../../models')
const admin_coupon = db.admin_coupon

exports.addOffer = async (req, res, next) => {
  const {
    offer_name,
    offer_type,
    offer_code,
    description,
    percentage,
    image,
    bg_color,
    maxAmount,
    maxDiscount,
    start_date,
    end_date,
  } = req.body

  try {
    const admin_id = req.user.id

    const isExist = await admin_coupon.findOne({
      where: {
        offer_code,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (isExist) {
      return res
        .status(500)
        .json({ status: false, message: "Can't generate duplicate coupon." })
    }

    const coupon = await admin_coupon.build({
      offer_name,
      offer_type,
      offer_code,
      description,
      percentage,
      image,
      admin_id,
      maxAmount,
      maxDiscount,
      start_date,
      end_date
    })

    if (!coupon) {
      return res
        .status(500)
        .json({ status: false, message: 'Coupon not generated.' })
    }

    if (bg_color) coupon.bg_color = bg_color
    await coupon.save()
    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getOffers = async (req, res, next) => {
  try {
    const offers = await admin_coupon.findAll({
      where: {
        admin_id: req.user.id,
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

exports.editOffer = async (req, res, next) => {
    try {
      const id = req.params.offerId
      const updateOffer = req.body
    const offer = await admin_coupon.findOne({
      where: {
        id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (!offer) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no such offer exist.' })
    }
    await offer.update(updateOffer)
    await offer.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.deleteOffer = async (req, res, next) => {
    try {
      const id = req.params.offerId
    const offer = await admin_coupon.findOne({
      where: {
        id,
        deleted: {
          [db.Sequelize.Op.not]: true
        }
      }
    })

    if (!offer) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no such offer exist.' })
    }
    offer.deleted = true
    await offer.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getOfferById = async (req, res, next) => {
  try {
    const id = req.params.offerId
    const offer = await admin_coupon.findOne({
      where: {
        id,
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

    if (!offer) {
      return res
        .status(404)
        .json({ status: false, message: 'Record not found.' })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: offer })
  } catch (err) {
    next(err)
  }
}
