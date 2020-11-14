var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var cors = require('cors')
// var session = require('express-session')
// const MongoStore = require('connect-mongo')(session)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const JwtUtil = require('./util/jwt');

var app = express();
// var corsOptions = {
//   origin: 'http://localhost:8080',
//   credentials: true,
//   maxAge: '1728000'
// }
//跨域的解决方案

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});
//代理 使用http-proxy-middleware
//proxy({target: "http://localhost:5000", changeOrigin: false , pathRewrite: {"^/api"}})
// 使用session跨域下cookie的解决方案 Ajax请求中{credentials: true} axios {withCredentails: true}
// app.use(cors(corsOptions))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//对token的校验
//前端代码需要对请求进行封装header
app.use(function (req, res, next) {
  let reg1 = /^\/register*/
  let reg2 = /^\/index*/
  let reg3 = /^\/login*/
  if(!reg1.test(req.url) && !reg2.test(req.url) && !reg3.test(req.url)) {
    let token = req.headers.token
    let jwt = new JwtUtil(token);
    let result = jwt.verifyToken()
    if( result == "err") {
      res.send({status: 403, msg: '登录已过期,请重新登录'});
    }else{
      next();
    }
  }else{
    next();
  }
})
//配置session 
// app.use(session({
//   name: "shaodw",
//   secret: 'user',
//   store: new MongoStore({
//     url: 'mongodb://127.0.0.1:27017/student',
//     touchAfter: 24 * 3600 
//   }),
//   saveUninitialized: false,
//   resave: false,
//   cookie: {
//     maxAge: 10*1000
//   }
// }))
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
