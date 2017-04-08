'use strict'

var 
    express = require('express')
  , http = require('http')
  , path = require('path')
  , flash = require("connect-flash")
  , passport = require("passport")
  , LocalStrategy = require("passport-local")
  , CONST = require("./constants.js")
  
  // Models
  , mongoConnect = require("./models-mongoose/mongoConnect")
  , usersModel = require("./models-mongoose/users")
  
  //Routes
  , routes = require('./routes')
  , usersRoutes = require("./routes/users")
  , shopifyOperationsRoutes = require('./routes/shopify-operations')

//auth support
passport.serializeUser(usersRoutes.serialize)
passport.deserializeUser(usersRoutes.deserialize)
passport.use(usersRoutes.strategy)

var app = express();

/*
  viewPath: '/node_modules/ui-product-manager'
  staticPath: '/node_modules/ui-product-manager'
*/

exports.configureApp = function(config) {
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

