const createWebsiteRoutes = require('./createWebsite/createWebsite.js')

exports.registerRoutes = (app) => {
    app.use('/createWebsite', createWebsiteRoutes)
}