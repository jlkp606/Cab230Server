var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();


router.get("/symbols",function(req,res,next) {
  let error = false;
  Object.keys(req.query).forEach(query => {
    if (query != "industry"){
      res.status(400).json({
        "error": true,
        "message": "Invalid query parameter: only 'industry' is permitted"
      })
      error = true;
    }
  })
  if (error){
    return
  }
  if (req.query.industry){
    req.db.from('stocks').select("name","symbol","industry").groupBy("name").where("industry", "=", req.query.industry)
    .then((rows) => {
      if (rows.length == 0){
        res.status(404).json({
          "error": true,
          "message": "Industry sector not found"
        })
      }
      res.json(rows)
    })
    .catch((err) => {
      res.json({"Error" : true, "Message" : "Error executing MySQL query"})
    })
  } else {
    req.db.from('stocks').select("name","symbol","industry").groupBy("name")
    .then((rows) => {
      res.json(rows)
    })
    .catch((err) => {
      res.json({"Error" : true, "Message" : "Error executing MySQL query"})
    })
  }
});



router.get("/:symbol",function(req,res,next) {
  if (Object.keys(req.query).length > 0){
    res.status(400).json({
      "error": true,
      "message": "Date parameters only available on authenticated route /stocks/authed"
    })
    error = true;
    return
  }
  req.db.from('stocks').where('symbol','=',req.params.symbol)
  .then((rows) => {
    if (rows.length == 0){
      res.status(404).json({
        "error": true,
        "message": "No entry for symbol in stocks database"
      })
    } else{
      res.json(rows[0])
    }
  })
  .catch((err) => {
    console.log(err);
    res.json({"Error" : true, "Message" : "Error executing MySQL query"})
  })
});



const authorize = (req, res, next) => {
  const authorization = req.headers.authorization
  let token = null;
  const secretKey = "secret key"

  if (authorization && authorization.split(" ").length === 2){
    token = authorization.split(" ")[1]
    console.log(token)
  } else{
    res.status(403).json({"error" : true, "Message": "Authorization header not found"})
    return
  }
  try {
    const decoded = jwt.verify(token, secretKey)
    console.log(decoded);
    if (decoded.exp < Date.now()) {
      res.json({"error" : true, "Message": "Token has expired"})
      return
    }
    next()
  } catch (e) {
    res.status(403).json({"error" : true, "Message": "Authorization header not found"})
  }

}




router.get("/authed/:symbol", authorize, function (req, res){
  let error = false;
  Object.keys(req.query).forEach(query => {
    if (query != "from" && query != "to"){
      res.status(400).json({
        "error": true,
        "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
      })
      error = true;
    }
  })
  if (req.query.from){
    if(!Date.parse(req.query.from)){
      res.status(400).json({
        "error": true,
        "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
      })
      error = true;
    } 
  }
  if (req.query.to){
    if(!Date.parse(req.query.to)){
      res.status(400).json({
        "error": true,
        "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
    })
    error = true;
  } 
}
  if (error){
    return
  }
  
  if(req.query.from && req.query.to){
    req.db.from('stocks').where('symbol','=',req.params.symbol)
      .where('timestamp', '>=' ,req.query.from)
      .where('timestamp', '<=' ,req.query.to)
    .then((rows) => {
      if (rows.length == 0){
        res.status(404).json({
          "error": true,
          "message": "No entries available for query symbol for supplied date range"
        })
      }else{
        res.json(rows)
      }
    })
    .catch((err) => {
      res.json({"Error" : true, "Message" : "Error executing MySQL query"})
    })
  } 
  else if(req.query.from){
    req.db.from('stocks').where('symbol','=',req.params.symbol)
      .where('timestamp', '>=' ,req.query.from)
    .then((rows) => {
      if (rows.length == 0){
        res.status(404).json({
          "error": true,
          "message": "No entries available for query symbol for supplied date range"
        })
      }else{
        res.json(rows)
      }
    })
    .catch((err) => {
      res.json({"Error" : true, "Message" : "Error executing MySQL query"})
    })
  } 
  else if(req.query.to){
    req.db.from('stocks').where('symbol','=',req.params.symbol)
      .where('timestamp', '<=' ,req.query.to)
    .then((rows) => {
      if (rows.length == 0){
        res.status(404).json({
          "error": true,
          "message": "No entries available for query symbol for supplied date range"
        })
      }else{
        res.json(rows)
      }
    })
    .catch((err) => {
      res.json({"Error" : true, "Message" : "Error executing MySQL query"})
    })
  } 
  else {
    req.db.from('stocks').where('symbol','=',req.params.symbol)
    .then((rows) => {
      if (rows.length == 0){
        res.status(404).json({
          "error": true,
          "message": "No entries available for query symbol for supplied date range"
        })
      } else{
        res.json(rows)
      }
      
    })
    .catch((err) => {
      res.json({"Error" : true, "Message" : "Error executing MySQL query"})
    })
  }
})

module.exports = router;
