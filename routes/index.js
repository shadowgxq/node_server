var express = require('express');
var router = express.Router();
var db = require('../db/db')
const md5 = require('../util/md5')
const JwtUtil = require('../util/jwt')

//通过session实现身份认证 
//1.浏览器访问服务器传一个sessionID
//2.服务器保存sessionID 并发送浏览器时携带cookie(自动完成)
//3.对浏览器二次访问cookie进行解析生成sessionID进行判断 是否保存在服务器

//首页
router.get('/index', function(req, res, next) {
//   if(req.session.username){
//     res.status(200)
//     res.send('你好'+req.session.username+'欢迎回来');
// }else{
//     res.send('未登录');
// }
  let token = req.headers.token
  let jwt = new JwtUtil(token);
  let result = jwt.verifyToken()
  if(result !== "err") {
    res.send({
      status: 200,
      massges: '欢迎回来',
      login: true
    })
  }else{
    res.send({
      status: 403,
      message: '请登录或者注册',
      login: false
    })
  }
  
});
//登录
router.get('/login', function(req, res, next) {
  const json = {
    "username": req.query.username
  }
  db.find('login',json, function(err, data) {
    if(err) return new Error(err)
    if(data.length !== 0) {
      if(md5(req.query.password) != data[0].password) {
        res.send({status:400,msg:'账号密码错误'});
      }else{
        let _id = data._id
        let jwt = new JwtUtil(_id)
        let token = jwt.generateToken()
        res.send({status:200,msg:'登陆成功',token:token});
      }
      // req.session.username = req.query.username
    }else{
      res.send({status:400,msg:'账号密码错误'});
    }
  })
})
//注册
router.post('/register', function(req, res, next) {
  const password = md5(req.body.password)
  console.log(req.body.username);
  const jsonfind = {
    "username" : req.body.username
  }
  const jsonInsert = {
    "username" : req.body.username,
    "password" : password
  }
  db.find('login',jsonfind, function(err ,data) {
    if(err) return new Error(err)
    if(data.length == 0) {
      db.insertOne('login',jsonInsert, function(err, data) {
        if(data) {
          res.send({status:200,msg: '注册成功'})
        }
      })
    }else{
      res.send({status:400,msg: '用户名已经存在'})
    }
  })
})
//登出
router.post('/logout', function(req, res ,next) {
  let token = req.headers.token
  let jwt = new JwtUtil(token)
  res.send({
    status: 200,
    message:'本地window.sessionStorage.clear()'
  })
})
//获取数据
router.get('/goodsList', function(req, res, next) {
  if(!req.query.pageSize){
    args = null
  }
  var size = parseInt(req.query.pageSize) 
  var page = parseInt(req.query.pageNo) 
  var args = {size: size,page: page}
  db.find('goodsList', {}, args , function(err, data) {
    if(err) return new Error(err)
    res.send({status: 200,data:data})
  })
})
//删除
router.get('/goodsListDelete', function(req, res ,next) {
  
  let id = parseInt(req.query.id)
  let that = this
  new Promise((resolve, reject) => {
    db.find('goodsList', {Id: id}, function(err, data) {
      resolve(data)
      reject(err)
    })
  }).then(data => {
    return new Promise((resolve, reject) => {
      let id = data[0].Id
      db.deleteMany('goodsList', {Id: id}, function(err, data) {
      resolve(data)
      reject(err)
      })
    })
  }).then(
    data => {
      res.send({status: 200, message:'删除成功'})
    }
  ).catch(err => {
    res.send({status: 304, message: '此商品不存在'})
  })
})
//更新
router.get('/update', function(req, res, next) {
  let id = parseInt(req.query.id)
  let that = this
  new Promise((resolve, reject) => {
    db.find('goodsList', {Id: id}, function(err, data) {
      resolve(data)
      reject(err)
    })
  }).then(data => {
    return new Promise((resolve, reject) => {
      let id = data[0].Id
      db.updateMany('goodsList', {Id: id}, {$set: req.query},function(err, data) {
      resolve(data)
      reject(err)
      })
    })
  }).then(
    data => {
      res.send({status: 200, message:'更新完成'})
    }
  ).catch(err => {
    res.send({status: 304, message: '此商品不存在'})
  })
})
//添加
router.get('/addGoodsList', function(req, res ,next) {
  let json = req.query
  json.Id = parseInt(req.query.Id)
  new Promise((resolve, reject) => {
    db.find('goodsList', {Id: req.query.Id}, function(err,data) {
      resolve(data)
      reject(err)
    })
  }).then( data => {
    if(data.length !== 0) {
      res.send({
        status:403,
        message: '存在此商品的Id，请重新输入'
      })
    }else{
      return new Promise((resolve, reject) => {
        db.insertOne('goodsList', json, function(err, data) {
          resolve(data)
          reject(err)
        })
      })
    }
  }).then( data => {
    if(data) {
      res.send({
        status: 200,
        message: '添加数据成功'
      })
    }else {
      res.status(403)
      res.send('添加失败')
    }
  }).catch(err => {
    console.log(err);
  })
})

module.exports = router;
