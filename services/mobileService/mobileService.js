require('dotenv').config()
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

exports.sendMobileVerificationCode = async options => {
  const { mobileNumber, message } = options
  client.messages
    .create({
      body: message,
      to: mobileNumber,
      from: process.env.MOBILE_NUMBER
    })
    .then(message => {
      console.log(message)
    })
    .catch(error => {
      console.log(error)
    })
}

exports.scheduleMessage = async () => {
  client.messages
  .create({
    body: 'This is a scheduled message',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    sendAt: new Date(Date.UTC(2024, 1, 6, 21, 30, 0)),
    scheduleType: 'fixed',
    to: '+916351273626'
  })
  .then(message => console.log(message.sid)).catch(err=>{
    console.log(err, '*******************************')
  })
}
