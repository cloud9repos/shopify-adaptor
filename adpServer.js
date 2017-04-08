'use strict'

var 
    express = require('express')
  , http = require('http')
  , path = require('path')
  , flash = require("connect-flash")
  , passport = require("passport")
  , LocalStrategy = require("passport-local")
  , CONST = require("./adpConstants.js")
  
  // Models
  , mongoConnect = require("./adp-mongoose/mongoConnect")
  , usersModel = require("./adp-mongoose/users")
  
  //Routes
  , routes = require('./routes')
  , usersRoutes = require("./routes/users")

//passport configuration
passport.serializeUser(usersRoutes.serialize)
passport.deserializeUser(usersRoutes.deserialize)
passport.use(usersRoutes.strategy)

var app = express();

mongoConnect.connect(CONST.MONGODB_URI, function(err) {
  if(err) throw err
})

usersRoutes.configure({
  users: usersModel
  , passport: passport
})

//app routes
app.get('/', routes.index);

//handle logout
app.get('/logout', usersRoutes.doLogout)

//check registered client and do login
app.get('/initshopify'
  , usersRoutes.initShopify
  , passport.authenticate('local', {failureRedirect: '/', failureFlash: true})
  , usersRoutes.postLogin)

//redirect uri to get access token
app.get('/registerclient'
  , usersRoutes.registerClient
  , passport.authenticate('local', {failureRedirect: '/', failureFlash: true})
  , usersRoutes.postLogin)
  
  

exports.app = app

exports.configureApp = function(config) {
  /*
    viewPath: '/node_modules/ui-product-manager'
    staticPath: '/node_modules/ui-product-manager'
  */
  
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + config.viewPath);
    app.engine('html', require('ejs').renderFile)
    
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser())
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat'}))
    app.use(flash())
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(app.router);
    app.use(express.static(path.join(__dirname, config.staticPath)))
  })
}

exports.createServer = function (config, callback) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'))
  })
  
  return callback()
}

