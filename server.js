const express = require('express')
const formidable = require('express-formidable')
const fs = require('fs')
const cors = require('cors')
const app = express()
const { registerRoutes } = require('./routes.js')

const port = 8080

app.use(cors({
  origin: ['http://192.168.0.22:8080', 'http://localhost:8080', 'http://home.uvucs.org','http://192.168.0.22:8081', 'http://localhost:8081']
}))

app.use(formidable())

registerRoutes(app)

app.use(express.static('dist'))

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})