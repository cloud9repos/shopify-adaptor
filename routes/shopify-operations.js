'use strict'

var users = undefined
    , MassProductsCreateClass = require('../shopify-business/mass-product-create.js')


exports.configure = function(params) {
    users = params.users
}

module.exports.initMassProductsCreate = function(req, res) {
    
    var self = this,
        productsConfig = req.body,
        massProductCreate = new MassProductsCreateClass(req.user, productsConfig)
        //massProductCreate = new MassProductsCreateClass(req.user, {})
        
    massProductCreate.initProductsCreation(function(err, resultData) {
        
        if(err) {
            //TODO
        }
        
        console.log('resultData', JSON.stringify(resultData))
        
    })
}
