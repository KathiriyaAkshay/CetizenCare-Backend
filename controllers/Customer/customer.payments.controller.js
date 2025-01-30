const db = require('../../models')
const refund_details = db.refund_details
const sub_category = db.sub_category
const vendor_service = db.vendor_service
const payment_details = db.payment_details
const booking = db.booking
const cart = db.cart
const calendar_booking_data = db.calendar_booking_data

exports.getAllPayments = async (req, res, next) => {
  try {
    const id = req.user.id
    // const booking_id_data = await booking.findAll({
    //   where: {
    //     customer: id
    //   }
    // })
    // if(!booking_id_data){
    //     return res.status(400).json({ status: false, message: "There is no payment happened."})
    // }
    // const payment_data = await payment_details.findAll({
    //   where: {
    //     booking: {
    //       [db.Sequelize.Op.in]: booking_id_data
    //     }
    //   }
    // })

    let payment_data = await cart.findAll({
      where: {
        customer: id,
        booking_id: {
          [db.Sequelize.Op.not]: null
        }
      },
      attributes: ['id', 'time'],
      include: [
        {
            model: calendar_booking_data,
            attributes: ['time_slot', 'date']
        },
        {
          model: vendor_service,
          attributes: ['images'],
          include: [
            {
              model: sub_category,
              attributes: ['name']
            }
          ]
        },
        {
          model: booking,
          attributes: ['refund_status', 'refund_date'],
          include: [
            {
              model: payment_details,
              where: {
                status: {
                    [db.Sequelize.Op.not]: 'pending'
                }
              },
              attributes: ['id', 'payment_intent_id', 'amount', 'time', 'refund_status', 'refund_date', 'checkout_session', 'trasaction_id']
            },
            {
              model: refund_details,
              attributes: [
                'id',
                'refund_id',
                'transaction_id',
                'charge_id',
                'payment_intent_id',
                'amount'
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    if (!payment_data) {
      return res
        .status(404)
        .json({ status: false, message: 'Unable to find required data.' })
    }

    payment_data = payment_data.filter(item => item?.booking?.payment_detail)
    const data = payment_data.map(item => {
      return {
        service_images: item?.vendor_service?.images,
        service_name: item?.vendor_service?.sub_category.name,
        cartId: item.id,
        time: item?.time,
        payment_detail: item?.booking?.payment_detail,
        refund_detail: item?.booking?.refund_detail,
        calendar_booking_data: item?.calendar_booking_datum,
      }
    })

    return res
      .status(200)
      .json({ status: true, message: 'Successful', data: data })
  } catch (err) {
    next(err)
  }
}
