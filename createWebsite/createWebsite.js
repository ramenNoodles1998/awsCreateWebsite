const express = require('express')
const router = express.Router()
const createWebsiteController = require('./createWebsiteController.js')

router.post('/', createWebsiteController.createWebsite)

module.exports = router