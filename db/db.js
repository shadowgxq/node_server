const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017";
const dbName = "test"

function _connectDB(callback) {
  MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true }, function(err, client) {
    if(err) {
      callback(err, null)
    }else{
      callback(err,client)
      console.log('connect success');
    }
  })
}

exports.insertOne = function(collectionName, json, callback) {
  _connectDB(function(err, client) {
    var db = client.db(dbName)
    db.collection(collectionName).insertOne(json, function(err, res) {
      callback(err, res)
      client.close()
    })
  })
}

exports.deleteMany = function (collectionName, json, callback) {
  _connectDB(function (err, client) {
      var db = client.db(dbName);
      db.collection(collectionName).deleteMany(
          json,
          function (err, results) {
              callback( err, results);
              client.close();
          }
      )
  })
}

exports.updateMany = function (collectionName, json1, json2, callback) {
  _connectDB(function (err, client) {
      var db = client.db(dbName);
      db.collection(collectionName).updateMany(
          json1,
          json2,
          function (err, results) {
              callback(err, results);
              client.close();
          }
      )
  })
}

exports.getAllCount = function (collectionName, callback) {
  _connectDB(function (err, client) {
      var db = client.db(dbName);
      db.collection(collectionName).count({}).then(function (count) {
          callback(count);
          client.close();
      })
  })
}

exports.find = function (collectionName, json, C, D) {
  var results = []; // 结果数组
  if (arguments.length == 3) {
      // 参数C是callback,参数D没有传。
      var callback = C;
      var skipnumber = 0;
      var limit = 0; // 数目限制
  } else if (arguments.length == 4) {
      var callback = D;
      var args = C; // 分页参数
      var skipnumber = args.size * args.page || 0; // 数据条数
      var limit = args.size || 0; // 数目限制
      var sort = args.sort || {}; // 排序方式
  } else {
      throw new Error("find函数的参数个数，必须是3个或者4个");
      return;
  }
  _connectDB(function (err, client) {
      var db = client.db(dbName);
      var result = db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
      result.toArray(function (err, docs) {
          if (err) {
              callback(err, null);
              client.close();
              return;
          }
          callback(null, docs);
          client.close()
      })
  })
}