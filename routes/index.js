
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
    var user = !!req.user ? req.user : null
    console.log("check")
    res.render('index.html', {
        user: user
    })
}

