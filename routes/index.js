
/*
 * GET home page.
 */
 
 var _ = require('lodash')
    , CONST = require("../adpConstants.js") 
 
 
exports.inheritConstant = function(parentConst) {
    _.each(parentConst, function(value, key) {
       CONST[key] = value 
    })
}
 
exports.index = function(req, res) {
    var store = !!req.user ? req.user : null
    
    if(store.isChargingConfirmed) {
        res.render('index.html', {
            store: store
        })
    } else {
        res.render('confirmCharg.html', {
            store: store
        })
    }
}

