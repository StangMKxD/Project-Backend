const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
require('dotenv').config();

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
readdirSync('./routers').map((r) => {
  console.log("📦 โหลด route:", r); 
  app.use('/api', require('./routers/' + r))
})

// const userRoutes = require('./routers/auth')
// app.use("/api", userRoutes)

app.listen(5000,() => console.log('Server is running on port 5000'))