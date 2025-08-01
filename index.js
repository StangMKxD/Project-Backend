const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
const { startBookingCleanupJob } = require('./controllers/auth')
require('dotenv').config();

app.use(morgan('dev'))
app.use(cors({
  origin: "http://localhost:3000", // ตรงกับที่ frontend ใช้
  credentials: true,
}))
app.use(express.json())
app.use("/uploads", express.static("uploads"));
readdirSync('./routers').map((r) => {
  console.log("📦 โหลด route:", r); 
  app.use('/api', require('./routers/' + r))
})

startBookingCleanupJob()

// const userRoutes = require('./routers/auth')
// app.use("/api", userRoutes)

app.listen(5000,() => console.log('Server is running on port 5000'))