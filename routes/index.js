
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
    var store = !!req.store ? req.store : null
  
    res.render('index.html', {
        store: store
    })
}

