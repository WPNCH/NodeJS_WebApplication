const express = require('express')
const app = express()
const path = require('path')
const router = require('./Routes/routes')
const jwt = require("jsonwebtoken")
const secret = 'topsecret'
const cookieParser = require('cookie-parser')
const logger = require('morgan')
var dbquery=require('./database')
const bcrypt = require('bcrypt')
require("dotenv").config();
const alert = require('alert')


app.set('views',path.join(__dirname,'views'))

app.set('view engine','ejs')
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

app.get("/",(req,res)=>{
   
    res.render('login.ejs',{loginstatus:''})
 
 })

 

app.post('/loginfunction',async(req,res)=>{
    const username = req.body.UserName
    const pass = req.body.Password

    const UserSearch =  `select * from BPUsers where UserName = '${username}'`

    dbquery.query(UserSearch, async(err,result)=>{
        if (err) throw (err)
        
        if (result.recordsets[0].length == 0){
            console.log("User does not exist")
            }
            else{ 
                var string = JSON.stringify(result.recordsets)
                var objects = JSON.parse(string)
                var storedpass = objects[0][0].Passwords
                var position = objects[0][0].Position
                var branch = objects[0][0].Branch

            if(await bcrypt.compare(pass,storedpass))
                {
                 var token = jwt.sign({user:username,position:position,branch:branch},process.env.secret,{expiresIn:'2h'})
                 res.cookie('auth',token)
                 console.log(token)
                 //console.log(res.cookie.auth)
                 return res.cookie('auth',token).redirect('/sql')
                }
            else
                { 
                
                return res.render('login',{loginstatus:'User Does Not Exist or Wrong Password'})
                }
        }
        return res.render('login',{loginstatus:'User Does Not Exist or Wrong Password'})
    })

}
)

app.use(express.static(path.join(__dirname,'public')))

app.use(router)





app.listen(3000,(condition)=>{
    condition = 'Running in port 3000'
    console.log(condition)
})