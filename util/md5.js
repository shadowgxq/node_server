var crypto = require('crypto')

function cryptoPwd(password, slat = "shadow") {
  var slatPassword = password + ':' + slat
  var md5 = crypto.createHash('md5')
  var result = md5.update(slatPassword).digest('hex')
  return result
}
module.exports = cryptoPwd