const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const User = require('./models/User')
const Light = require('./models/Light')
const mongoose = require("mongoose")
const validator = require("validator")
const https = require("https")
var crypto = require("crypto");
var path = require('path')
const passport = require('passport')
const session = require('express-session')
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require("nodemailer");
SALT_WORK_FACTOR = 5;
const mqtt = require('mqtt')
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
require('events').EventEmitter.defaultMaxListeners = 0

mongoose.connect("mongodb+srv://chenqiang:Cq668471@sit314.hnfqz.mongodb.net/sit314DB?retryWrites=true&w=majority")

//mongoose.connect("mongodb://localhost:27017/sit314DB",{useNewUrlParser:true})

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}))


app.engine('html', require('express-art-template'))
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

//session
app.use(session({
  cookie:{maxAge: 120000},
  resave:false,
  saveUninitialized:false,
  secret:'$$$DeakinSecret'
}))
app.use(passport.initialize())
app.use(passport.session());

//passport config
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//route
app.get('/', function (req, res){
  res.render('login.html', { user : req.user })
})

app.get('/register', function (req, res){
  res.render('register.html')
})

app.get('/controlSystem',(req, res)=>{
  
  if(req.isAuthenticated()
    )
    { res.render('controlSystem.html')
    console.log('success!')
  }
    else
    {res.redirect('/')}
  })

app.get('/public/images/*', function (req, res){
  res.sendFile( __dirname + "/" + req.url );
})

//forget password
app.get('/forgetPwd', function (req, res){
  res.render('forgetPwd.html')
})

//reset password
app.get('/forgetPwd/resetPwd', function (req, res){
  res.render('resetPwd.html')
})

app.get('/controlSystem/lightMonitoring1', function (req, res){
  res.render('lightMonitoring1.html')
})
app.get('/controlSystem/lightMonitoring2', function (req, res){
  res.render('lightMonitoring2.html')
})
app.get('/controlSystem/lightMonitoring3', function (req, res){
  res.render('lightMonitoring3.html')
})
app.get('/controlSystem/lightMonitoring4', function (req, res){
  res.render('lightMonitoring4.html')
})


//post 


app.post('/', passport.authenticate('local'), function(req, res) {
  res.redirect('/controlSystem');
});

//insert function
function insert(id,username,country,fName,lName,email,psw,adress1,adress2,city,state,zip,pNumber){

var user =  new User({
  id: id,
  username:username,
  country: country,
    firstName: fName,
    lastName: lName,
    email: email,
    password: psw,
    address1:adress1,
    address2:adress2,
    city: city,
    state: state,
    postalCode: zip,
    phoneNumber: pNumber
  }
        );
user.save(function(err,res){
    if(err){
        console.log(err);
    }
    else{
        console.log(res);
    }
})
}

app.post('/register', function (req, res) {

  res.setHeader('Content-type','application/json;charset=utf-8');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  
  var id = req.body.first_name+req.body.email;
  var country = req.body.country;
  var username = req.body.email;
  var fName = req.body.first_name;
  var lName = req.body.last_name;
  var email = req.body.email;
  var psw = req.body.password;
  var c_psw = req.body.confirm_password;
  var adress1 = req.body.address1;
  var adress2 = req.body.address2;
  var city = req.body.city;
  var state = req.body.state;
  var zip = req.body.zip;
  var pNumber = req.body.phone_number;
  
  var updatestr = {email: email};
  
  var md5 = crypto.createHash("md5");
  var newPas = md5.update(psw).digest("hex");


  User.find(updatestr, function(err, obj){
      if (err) {
        return res.status(500).json({
          success: false,
          message: "err"
        })
      }
      
      if(psw.length < 8)
      {
        return res.status(200).json({
          err_code: 2,
          message:"Password can not be less than 8 letters"
         })
        
      }
      
     if(psw != c_psw)
         {
           return res.status(200).json({
             err_code: 3,
             message:"The two password inputs are inconsistent"
            })
         }

         if(obj.length != 0)
      {
        return res.status(200).json({
          err_code: 1,
          message:"email existed"
         })
        
      }
     
        User.register(new User({id:id,username: username,
          country : req.body.country,
          firstName : req.body.first_name,
          lastName : req.body.last_name,
          email : req.body.email,
          adress1 : req.body.address1,
          adress2 : req.body.address2,
          city : req.body.city,
          state : req.body.state,
          postalCode : req.body.zip,
          phoneNumber : req.body.phone_number }), req.body.password, function(err, User) {
          if (err) {
            console.log("err")
              
          }
          res.redirect('./controlSystem');
        
      });



      

})  
});

app.post('/forgetPwd', function (req, res){
  var email = req.body.email;
  User.findOne({
    email: email},function (err, user){

      if(err) { 
        console.log('err')
        return res.status(500).json({
            err_code:500,
            message: 'err'
        })
    }
    
     if(!user) {
      return res.status(200).json({
          err_code: 1,
          message: 'email not existed'
      })
  }
  //send reset email
  var smtpTransport = nodemailer.createTransport({
    host: 'smtp.qq.com',//qq email server
    port: 465,
    secure: true, // use SSL
    auth: {
    user: '992974106@qq.com',
    pass: 'texyxgartukdbebf'
    }
    });
    
    var mailOptions = {
    　　from: "992974106@qq.com",
    　　to: email,
    　　subject: "controlSystem password reset",
    　　html:"<h1>Hi,"+email+"</h1><br> <p>click <a href='https://sit-314.herokuapp.com/forgetPwd/resetPwd'>here</a> to reset your password</p>"
    }
   // https://sit-314.herokuapp.com/ http://localhost:5000/
    smtpTransport.sendMail(mailOptions, function(err, resp){
      　　if(err){
      　　　　console.log(err)
      　　}
      console.log("send successfully")
      　　smtpTransport.close();//close connect
      });
  return res.status(200).json({
    err_code: 0,
    message: 'send reset email successfully'
})
    })


})

app.post('/forgetPwd/resetPwd', function (req, res){
  var email = req.body.email;
  var psw = req.body.password;


  User.findOne({
    email: email},function (err, user){

      if(err) { 
        return res.status(500).json({
            err_code:500,
            message: 'err'
        })
    }
    
     if(!user) {
      return res.status(200).json({
          err_code: 1,
          message: 'email not existed'
      })
  }

  user.setPassword(psw,  function(){
    user.save();
    return res.status(200).json({
      err_code: 0,
      message: 'reset password successfully'
  })
  })
  
    })

})

app.post('/controlSystem/lightMonitoring', function (req, res){
    var id =req.body.id;
    var area =req.body.area;
    //console.log(area+'!');
  Light.findOne({
    id: id,area:area},function (err, light){

      if(err) { 
        return res.status(500).json({
            err_code:500,
            message: 'err'
        })
    }
    
     if(!light) {
      return res.status(200).json({
          err_code: 3,
          message: 'light not existed'
      })
  }
  if(light.state =="off")
  {Light.updateOne(
    {id: id,area:area},
    {state : "on"},
    (err)=>{
      if (err) {res.send(err)}
      else {
        turnOnLight();
        return res.status(200).json({
          err_code: 1,
          message: 'switch successfully'
      })}
  }
  )
}
  else 
  {Light.updateOne(
    {id: id,area:area},
    {state : "off"},
    (err)=>{
      if (err) {res.send(err)}
      else {
        turnOffLight();
        return res.status(200).json({
          err_code: 2,
          message: 'switch successfully'
      })}
  }
  )
}

    })
})


app.post('/controlSystem/changeMode', function (req, res){
    var area =req.body.area;
    var mode =req.body.mode;
    Light.find({
      area:area},function (err, light){
  
        if(err) { 
          return res.status(500).json({
              err_code:500,
              message: 'err'
          })
      }
      
       if(!light) {
        return res.status(200).json({
            err_code: 3,
            message: 'light not existed'
        })
    }
    Light.updateMany(
      {area:area},
      {mode:mode},
      (err)=>{
        if (err) {res.send(err)}
        else {
          return res.status(200).json({
            err_code: 1,
            message: 'change the mode successfully'
        })}
    }
    )
    

      })
})

function turnOnLight()
{
  //an api
  //turn on the light
}

function turnOffLight(){
  //an api
  //turn off the light
}


var topic="/light";
client.on('connect', () =>
{
 client.subscribe(topic);
 //console.log('mqtt connected');
});
client.on('message', (topic, message) =>
{
 console.log("Topic is: " + topic)
 console.log("The message is: " + message)
});


app.listen(process.env.PORT || 5000, ()=>{
  console.log('Server started on port 5000');
})



