const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(express.json())

mongoose.connect("mongodb+srv://rohandb:rohandb123@testdata.kdgizeo.mongodb.net/employe")
.then(()=>console.log("mongoDB conected..."))
.catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    email : {
        type : String
    },
    token : {
        type : String
    }
})

const user = mongoose.model("user",userSchema);

app.post("/register",async (req,res)=>{
try {
    
        const {firstName,lastName,password,email} = req.body;
        if(!(firstName && lastName && email && password)){
         res.status(400).send("All feilds are required...")
        }
        const emailFound = await user.findOne({email})
        if(emailFound){
         res.status(400).send("User alredy exists...")
        }
     
        const encrypetdPass = await bcrypt.hash(password,10)
        const createUser = await user.create({
         firstName,
         lastName,
         password : encrypetdPass,
         email
     
        })
        const token = jwt.sign(
            {id : createUser._id ,email},
            "Rohan",
            
        
        )
        createUser.token = token
        createUser.password = undefined

        res.status(200).json(createUser)
    
     
} catch (error) {
    console.log(error)
}
})

app.post("/check" , async (req,res)=>{
   try {
        const{password,email} = req.body
        if(!(password && email)){
        res.send("enter the details...").status(401)

        const userDetails = await user.findOne({ email })

        
        const checkingPass = await bcrypt.compare(password,userDetails.password)

        if(userDetails && (checkingPass)){
            const token = jwt.sign(
                {id : createUser._id},
                "Rohan",
                {
                    expriesIn : "2h"
                }
            
            )
            userDetails.token = token
            userDetails.password = undefined
            
            const options = {
                expries : new Date(Date.now() + 3* 24 * 60 * 60 * 1000),
                httpOnly : true
            }
            res.status(200).cookie("token",token,options).json({
                success : true,
                token,
                userDetails
            })
        }
        
   }

   } catch (error) {
      console.log(error)
   }

})

app.listen(3000,()=>{
    console.log("server is runnig at port 3000")
})