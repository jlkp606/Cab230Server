var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var router = express.Router();

/* GET users listing. */
router.post("/register", function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password){
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }
  const queryUsers = req.db.from("users").select("*").where("email", "=", email)
  queryUsers
    .then((users) => {
      console.log(users)
      console.log("im in \n\n\n\n")
      if (users.length > 0){
        res.status(409).json({
          "error": true,
          "message": "User already exists!"
        })
        return
      }
      
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds)
      return req.db.from("users").insert({email, hash});
    })
    .then(() => {
      res.status(201).json({
        success: true,
        message: "User created"
      })
    })
  
})

router.post("/login", function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password){
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }

  let resJson = {};
  const queryUsers = req.db.from("users").select("*").where("email", "=", email)
  queryUsers
    .then((users) => {
      if (users.length === 0){
        res.status(400).json({
          error: true,
          message: "Incorrect email or password"
        })
      }
      
      
      // Compare password hashes
      const user = users[0]
      if(bcrypt.compare(password, user.hash)){
        resJson = {
          success: true
        }
      } else{
        res.status(401).json({
          error: true,
          message: "Incorrect email or password"
        })
      }
      return resJson
    })
    .then((resJson) => {
      if (resJson.success){
        const secretKey = "secret key"
        const expires_in = 60 * 60 * 24
        const exp = Date.now() + (expires_in * 1000);
        const token = jwt.sign({email, exp}, secretKey)
        res.json({ token_type: "Bearer", token, expires_in})
      }
    })

})

module.exports = router;
