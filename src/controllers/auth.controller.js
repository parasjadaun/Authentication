import userModel from '../models/user.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js'

async function registerUser(req,res){
    const {username,email,password}=req.body

    if(!username || !email || !password){
        return res.status(400).json({message:'All fields are required to send a request to register a user'});
    }

    const userExists= await userModel.findOne({
$or:[
    {email:email},
    {username:username}
]
})

    if(userExists){
        return res.status(409).json({message:'User already exists with this email or username '});
    }
   const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
const newUser= await  userModel.create({
    username,
    email,
    password:hashedPassword
})
const token = jwt.sign(
    { userId: newUser._id },
   config.JWT_SECRET,
    { expiresIn: '7d' }
);
return res.status(201).json({message:'User registered successfully',user:newUser,token:token});
}
async function getme(req,res){
const token=req.headers.authorization?.split(' ')[1];
if(!token){
    return res.status(401).json({message:'Authorization token is missing'});    
}
try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) {
        return res.status(404).json({message:'User not found'});
    }
    return res.status(200).json({user});
} 
catch (error) {
    return res.status(401).json({message:'Invalid token'});
}
return res.status(200).json({message:'User fetched successfully',user:user});
}

export default {registerUser,getme};