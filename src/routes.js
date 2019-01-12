'use strict'

let webController = require('./controllers/web-controller')
let apiController = require('./controllers/api-controller')

module.exports = (app) => {
    // Api Routes
    let apiPrefix = '/api/v1'

    app.get(apiPrefix + '/profits/:endpoint', (req, res) => {
        apiController.getProfits(req, res)
    })

    // Web Routes
    app.get('/', (req, res) => {
        webController.homePage(req, res)
    })

    app.use((req, res) => {
        webController.errorPage(req, res)
    })
}
