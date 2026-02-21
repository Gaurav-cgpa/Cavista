
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../schema/user.js";

export const signup=async(req,res)=>{
    try {
        const {email,username,password}=req.body;

        if(!email || !username || !password)
        {
            return res.status(400).json({success:false,message:"All fields are required"});
        }

        const username_exist=await User.findOne({username});
        if(username_exist)
        {
            return res.status(400).json({success:false,message:"Username already exist"});
        }

        const email_exist=await User.findOne({email});
        if(email_exist)
        {
            return res.status(400).json({success:false,message:"Email already exist"});
        }

        if (password.length < 6) {
            return res.status(400).json({success:false, message: "Password must be at least 6 characters" })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser=new User({
            email,
            username,
            password:hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

        res.cookie("jwt-cookie", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            samesite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...newUser._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.log("Error in signup controller",error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
};

export const login=async(req,res)=>{
    try {
        const {username,password}=req.body;

        if(!username||!password)
        {
            return res.status(400).json({success:false,message:"All fields are required"});
        }   

        const userExist=await User.findOne({username});
        if(!userExist)
        {
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }

        if (password.length < 6) {
            return res.status(400).json({success:false, message: "Password must be at least 6 characters" })
        }

        const isPasswordValid=await bcryptjs.compare(password,userExist.password);
        if(!isPasswordValid)
        {
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }   

        const token=jwt.sign({userId:userExist._id},process.env.JWT_SECRET,{expiresIn:"3d"});

        res.cookie("jwt-cookie",token,{
            httpOnly:true,
            maxAge:3*24*60*60*1000,
            samesite:"strict",
            secure:process.env.NODE_ENV==="production",
        });

        res.status(201).json(
            {
                success:true,
                message:"Logged in successfully",
                user:{
                    ...userExist._doc,
                    password:undefined,
                }
            }
        );
    } catch (error) {
        console.log("Error in login ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout=async(req,res)=>{
    res.clearCookie("jwt-cookie");
    res.status(200).json({success:true,message:"Logged out successfully"});
};