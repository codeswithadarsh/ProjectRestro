const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/LoginForm")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

// Now Create DB (schema)

const LogInSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection = new mongoose.model('LogInCollection', LogInSchema)

module.exports = collection
