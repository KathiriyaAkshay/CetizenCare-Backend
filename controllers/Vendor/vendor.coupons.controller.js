const db = require('../../models')
const vendor_coupon = db.vendor_coupon

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
    const vendor_id = req.user.id

    const isExist = await vendor_coupon.findOne({
      where: {
        offer_code
      }
    })

    if (isExist) {
      return res
        .status(500)
        .json({ status: false, message: "Can't generate duplicate coupon." })
    }

    const coupon = await vendor_coupon.build({
      offer_name,
      offer_type,
      offer_code,
      description,
      percentage,
      image,
      vendor_id,
      maxAmount,
      maxDiscount,
      start_date,
      end_date,
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
    const offers = await vendor_coupon.findAll({
      where: {
        vendor_id: req.user.id,
        deleted: {
            [db.Sequelize.Op.not]: true}
      },
      attributes: [
        'id',
        'offer_name',
        'offer_type',
        'percentage',
        'offer_code',
        'offer_type',
        'description',
        'image',
        'bg_color',
        'maxAmount', 
        'maxDiscount',
        'start_date',
        'end_date'
      ],
      order: [['updatedAt', 'DESC']]
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
  const id = req.params.offerId
  const updateOffer = req.body
  try {
    const offer = await vendor_coupon.findOne({
      where: {
        id
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
  const id = req.params.offerId
  try {
    const offer = await vendor_coupon.findOne({
      where: {
        id
      }
    })

    if (!offer) {
      return res
        .status(404)
        .json({ status: false, message: 'There is no such offer exist.' })
    }
    await offer.destroy({ where: { id } })
    await offer.save()

    return res.status(200).json({ status: true, message: 'Successful' })
  } catch (err) {
    next(err)
  }
}

exports.getOfferById = async (req, res, next) => {
  try {
    const id = req.params.offerId
    const offer = await vendor_coupon.findOne({
      where: {
        id,
        deleted: {
          [db.Sequelize.Op.not]: true
      }},
      attributes: [
        'id',
        'offer_name',
        'offer_type',
        'percentage',
        'offer_code',
        'offer_type',
        'description',
        'image',
        'bg_color',
        'maxAmount',
        'maxDiscount',
        'start_date',
        'end_date'
      ]
    })

    if (!offer) {
      return res
        .status(400)
        .json({ status: false, message: "Offer doesn't exist." })
    }

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: offer })
  } catch (err) {
    next(err)
  }
}
