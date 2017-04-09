'use strict'

var 
    express = require('express')
  , http = require('http')
  , path = require('path')
  , flash = require("connect-flash")
  , passport = require("passport")
  , LocalStrategy = require("passport-local")
  , CONST = require("./adpConstants.js")
  , _ = require('lodash')
  
  // Models
  , mongoConnect = require("./adp-mongoose/mongoConnect")
  , usersModel = require("./adp-mongoose/users")
  
  //Routes
  , routes = require('./routes')
  , usersRoutes = require("./routes/users")



var app = express();

exports.adpInitConfig = function(parentConst) {
  usersRoutes.inheritConstant(parentConst)
  routes.inheritConstant(parentConst)
  
  //passport configuration
  passport.serializeUser(usersRoutes.serialize)
  passport.deserializeUser(usersRoutes.deserialize)
  passport.use(usersRoutes.strategy)
  
  // configure user routes
  usersRoutes.configure({
    users: usersModel
    , passport: passport
  })
  
}

exports.inheritConstant = function(parentConst) {
    _.each(parentConst, function(value, key) {
       CONST.key = value 
    })
}

exports.adpMongoConnect = function(config, callback) {
  mongoConnect.connect(config.MONGODB_URI, function(err) {
  if(err) return callback(err)
  
  return callback()
})
}

exports.adpInitRoutes = function(config) {
  //app routes
  app.get('/', routes.index)
  
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
    
}

exports.app = app

exports.adpConfigureApp = function(config) {
  /*
    viewPath: '/node_modules/ui-product-manager'
    staticPath: '/node_modules/ui-product-manager'
  */
  
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, config.viewPath));
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

exports.adpCreateServer = function (config, callback) {
  var server = http.createServer(app)
  
  server.listen(app.get('port'), function(){
    console.log("Express server: " + JSON.stringify(server.address()))
    
  })
  
  return callback()
}

