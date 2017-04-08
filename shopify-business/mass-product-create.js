"use strict"

var ShopifyApiClass = require('shopify-node-api')
    , async = require('async')
    , shopifyAPI



/*
    this = {
        user                        : obj
        requestDataToCreateProduct  : obj
        productsConfig              : obj
    }
*/
var MassProductCreate = function(user, productsConfig) {
    console.log("user mass", user)
    shopifyAPI = new ShopifyApiClass({
        shop            :   user.username,
        access_token    :   user.access_token
        
    })
    
    this.requestDataToCreateProduct = {}
    this.user = user
    this.productsConfig = productsConfig
    
    this.productsConfig.numberOfProductToCreate = productsConfig.numberOfProductToCreate || 1
}

/*
    productsConfig: {
        numberOfProductToCreate: number
        
    }
*/

MassProductCreate.prototype.initProductsCreation = function(callback) {
    
    var self = this,
        nextProductNumberToCreate = 0,
        resultData = {
            errArr : [],
            dataArr : []
        }
    
    async.whilst(
        
        //condition check
        function() {
            return nextProductNumberToCreate < self.productsConfig.numberOfProductToCreate
        },
        
        //business logic
        function(callback) {
            
            self.constructNextSingleProductData(nextProductNumberToCreate)
            
            self.createNextProduct(function(err, data) {
                
                if(err) {
                    //TODO
                    resultData.errArr.push(err)
                    return callback()
                }
                
                nextProductNumberToCreate++
                resultData.dataArr.push(data)
                
                return callback()
            })
        },
        
        //main callback
        function(err) {
            
            if(err) {
                //TODO
            }
            
            callback(null, resultData)
        }
        
    )
    
}

MassProductCreate.prototype.constructNextSingleProductData = function(nextProductNumberToCreate) {
    
    var self = this
        , productsConfig = self.productsConfig
    
    self.requestDataToCreateProduct = {
        "product": {
            "title"         :   "Product Number " + nextProductNumberToCreate,
            "body_html"     :   "<strong>Mass Product<\/strong>",
            "vendor"        :   "Burton",
            "product_type"  :   "Snowboard",
            "tags"          :   "Barnes & Noble, John's Fav, \"Big Air\""
        }
    }
    
}

MassProductCreate.prototype.createNextProduct = function(callback) {
    
    var self = this
    
    shopifyAPI.post('/admin/products.json', self.requestDataToCreateProduct, function(err, data, headers) {
        
        if(err) {
            //TODO
            callback(err)
        }
        
        callback(null, data)
        
    })
    
}


module.exports = MassProductCreate