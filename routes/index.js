
/*
 * GET home page.
 */
 
var notes = undefined

exports.configure = function(params) {
    notes = params.model
}
 
exports.index = function(req, res) {
    var user = !!req.user ? req.user : null
    console.log("check")
    res.render('index.html', {
        user: user
    })
}

