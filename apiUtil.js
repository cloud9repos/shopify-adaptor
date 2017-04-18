'use strict'

var ShopifyAPI = require('shopify-node-api')
var CONST = require("./adpConstants.js")
var _ = require('lodash')


module.exports.apiCall = function(options, callback) {
    /*
    data
    method
    relativeUri
    myshop: // myshop.myshopify.com 
    access_token
    */
    
    var shopify = new ShopifyAPI({
      shop: options.myshop, // myshop.myshopify.com 
      shopify_api_key: CONST.CLIENT_ID, // Your API key 
      shopify_shared_secret: CONST.CLIENT_SECRET, // Your Shared Secret 
      access_token: options.access_token, //permanent token 
    });
    
    shopify[options.method](options.relativeUri, function(err, data, headers){
        if(err) {
            console.log("ERROR, apiCall")
            return callback(err)
        }
        console.log("data",data); // Data contains product json information 
        console.log("headers",headers); // Headers returned from request 
    });
}