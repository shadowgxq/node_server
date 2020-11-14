const UtilJwt = require('./util/jwt')
var id = 1

var jwt = new UtilJwt(id)
var token = jwt.generateToken()
console.log(token);

setTimeout(function() {
  var jwt1 = new UtilJwt(token)
var res = jwt1.verifyToken()
console.log(res);
}, 2000)


