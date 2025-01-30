const cron = require('node-cron')
const moment = require('moment-timezone')
require('dotenv').config()
const db = require('../../models')
const { sendMobileVerificationCode } = require('../mobileService/mobileService')
const Customer = db.Customer
const Vendor = db.Vendor
const cart = db.cart
const calendar_booking_data = db.calendar_booking_data
const vendor_service = db.vendor_service
const sub_category = db.sub_category

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

function isDifferenceGreaterThanTwoHours (targetDate, targetTime) {
  const [targetDatePart, targetTimeRange] = targetDate.toISOString().split('T')
  const targetStartTime = targetTime.split('-')[0].trim()

  const finalPart = `${targetDatePart} ${targetStartTime}`
  const utcTime = moment.tz(finalPart, "UTC");

  const originalDate = utcTime.tz("US/Eastern").format();
  const now = moment().tz("US/Eastern").format();
  const timeDifference = originalDate - now
  const hoursDifference = timeDifference / (1000 * 60 * 60)
  return Math.abs(hoursDifference) < 2
}

cron.schedule('*/15 * * * *', async () => {
  try {
    let data = await cart.findAll({
      where: {
        isMessageSent: {
          [db.Sequelize.Op.not]: true
        }
      },
      attributes: ['id'],
      include: [
        {
            model: vendor_service,
            include: [
                {
                    model: sub_category,
                    attributes: ['id', 'name']
                }
            ]
        },
        {
          model: calendar_booking_data,
          where: {},
          attributes: ['date', 'time_slot']
        },
        {
          model: Customer,
          as: 'cart_customer',
          attributes: ['id', 'mobileNumber', 'firstname', 'lastname']
        },
        {
          model: Vendor,
          as: 'cart_vendor',
          attributes: ['id', 'mobileNumber', 'firstname', 'lastname']
        }
      ]
    })
    // let temp = new Date()
    // console.log(`inside cron ------------------------ ${temp}`)
    let final = data.filter(item => {
      return isDifferenceGreaterThanTwoHours(
        item?.calendar_booking_datum?.date,
        item?.calendar_booking_datum?.time_slot
      )
    })

    let cart_id = []
    const promises = final.map(async item => {
      cart_id.push(item?.id)
      const customerMobileNumber = item.cart_customer.mobileNumber
      const vendorMobileNumber = item.cart_vendor.mobileNumber
        // console.log(item?.vendor_service?.sub_category)
      // Send mobile verification code for customer
      const promise1 = sendMobileVerificationCode({
        mobileNumber: customerMobileNumber,
        message: `Dear ${item?.cart_customer?.firstname}, this is a reminder that your service appointment for ${item?.vendor_service?.sub_category?.name} is about to start at ${item?.calendar_booking_datum?.time_slot} (EST). Please check the service details`
      })

      // Send mobile verification code for vendor
      const promise2 = sendMobileVerificationCode({
        mobileNumber: vendorMobileNumber,
        message: `Dear ${item.cart_vendor?.firstname}, this is a reminder that your service appointment for ${item?.vendor_service?.sub_category?.name} is about to start at ${item?.calendar_booking_datum?.time_slot} (EST). Please check the service details`
      })

      // Return the promises
      return Promise.all([promise1, promise2])
    })

    // Use Promise.all to wait for all messages to be sent
    Promise.all(promises)
      .then(() => {
        console.log('All messages sent successfully.')
      })
      .catch(error => {
        console.error('Error sending messages:', error)
      })

      await cart.update({
        isMessageSent: true
      },{
        where: {
            id: {
                [db.Sequelize.Op.in]: [...cart_id]
            }
        }
      })

  } catch (err) {
    console.log(err)
  }
})
