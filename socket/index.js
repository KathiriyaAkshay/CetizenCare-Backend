exports.initializeSocketIO = io => {
  return io.on('connection', socket => {
    console.log('A user connected')
    socket.on('chat-message', msg => {
      console.log('message: ' + msg)
    })

    // socket.on('some-event', data => {
    //   console.log('data : ', data)
    //   console.log('this is console')
    // })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

//Common handler to emit event for particular room id
exports.emitSocketEvent = (io, roomId, event, payload) => {
    io.emit(`${event}_${roomId}`, payload)
}

exports.addedToCart = (io, data) => {
  io.emit('addedToCart', {
    // status: data?.status,
    message: data?.message,
    type: data?.type,
    id: data?.id
  })
}

exports.orderAccepted = (io, data) => {
  io.emit('orderAccepted', {
    message: data?.message,
    type: data?.type,
    id: data?.id
  })
}

exports.orderRejected = (io, data) => {
  io.emit('orderRejected', {
    message: data?.message,
    type: data?.type,
    id: data?.id,
    reason: data?.reason
  })
}

// exports.payment_intent_success = (io, data) =>{
//     io.emit('payment_intent_success', {

//     })
// }

exports.charge_successful = (io, data) => {
  io.emit('charge_succeeded', {
    type: data?.type,
    message: data?.message,
    vendorId: data?.vendorId,
    payment_successful: 'Payment_Successful',
    service_details: data?.service_details
  })
}

exports.service_successful = (io, data) => {
  io.emit('service_successful', {
    type: data?.type,
    message: 'Service Successful'
  })
}

exports.review_added = (io, data) => {
  io.emit('review_added', {
    type: 'Customer',
    message: 'Review Added'
  })
}

// Use for frontend to emit event's at frontend
exports.frontendEvent = (io, data, eventName) => {
    io.emit(eventName, data)
}