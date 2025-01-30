const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const helmet = require('helmet')
const socketIo = require('socket.io')
require('dotenv').config()
const appRoutes = require('./routes/v1')
require('./models')
const app = express()
const server = http.createServer(app)
const { initializeSocketIO } = require('./socket/index')
require('./services/cronJob/cron-message')

app.use(helmet());

const io = socketIo(server, {
  cors: {
    origin: '*'
  }
})

const PORT = process.env.PORT | 8080
const corsOptions = {
  origin: ['https://admin.cetizencare.com', 'https://backend.cetizencare.com', 'http://18.219.120.123:8080', 
  'http://localhost:3000', 'http://127.0.0.1:3000', 'https://service.cetizencare.com', 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://vendor.cetizencare.com'],
  credentials: true,
  methods: 'PUT,GET,POST,PATCH, DELETE'
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use((req, res, next) => {
  req.io = io
  next()
})

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin')
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST')
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, token, Authorization'
//   )

//   next()
// })
initializeSocketIO(io)

io.emit('some-event', { data: 'Some-data' })

app.use(express.json())

app.use(bodyParser.json())
// app.use(bodyParser.raw({ type: 'application/json' }))

app.use('/api/v1', appRoutes)

app.get('/health-check', (req, res, next)=>{
    return res.status(200).json({status: true, message: "Successful"})
})

app.use((error, req, res, next) => {
  //error handling middleware
  const statusCode = error.statusCode || 500
  const message = error.message
  console.log(message)
  // const data = error.data;
  return res.status(statusCode).json({ status: false, message: 'Something went wrong' })
})

server.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`)
})
