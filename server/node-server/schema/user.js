import mongoose from "mongoose";

const userSchema=mongoose.Schema({
   
    fullName:{
        type:String,
    },
    username:{
        type:String,
        unique:true,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
    },
    age:{
        type:Number,
    },
    gender:{
        type:String,
    },
    height:{
        type:Number,
    },
    weight:{
        type:Number,
    },
    dob:{
        type:Date,
    },
    bloodGroup:{
        type:String,
    },
},{timestamps:true});

const User=mongoose.model("User",userSchema);

export default User;