const User = require('./jasmine-standalone-3.5.0/src/User.js')
const Space = require('./jasmine-standalone-3.5.0/src/Space.js')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.get('/', (req,res)=> { //get method
  //res.sendFile(path.join(__dirname + '/views/index.html')); //send response
  res.render('index')// { status: req.session.status } )
})

app.get('/main', async (req,res)=> {
  var data = await Space.retrieve();
  res.render('main', { spaces: data.rows, username: req.session.username } )
})

app.post('/signupsubmit', (req,res)=> { //post method
  req.session.username = req.body.name;
  var email = req.body.email;
  var password = req.body.psw;
  User.create(req.session.username, email, password)
  res.redirect('/main')
})

app.post('/loginsubmit', async (req,res)=> {

  var email = req.body.user_email;
  var password = req.body.user_password;
  var verifyUser = await User.verify(email, password)
  console.log(verifyUser);
 
  if (verifyUser == false) { //replace true with authenticate method call
    //res.session.status = "Incorrect Login Details"
    res.redirect('/')
  } else {
    //req.session.status = ""
    req.session.userid = verifyUser.id;
    req.session.username = verifyUser.name;
    res.redirect('/main')
  }
})

app.post('/make_listing', async (req,res)=>{
  var name = req.body.listing_name;
  var description = req.body.listing_description;
  var price = req.body.listing_price;
  var date_from = req.body.listing_date_from;
  var date_to = req.body.listing_date_to;
  await Space.create(name, description, price, date_from, date_to)
  res.redirect('/main');

})

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
