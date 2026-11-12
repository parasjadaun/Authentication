import userModel from '../models/user.model.js';
import crypto from 'crypto';
import sessionModel from '../models/session.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js'
import sendEmail from '../services/email.services.js';
import otpModel from '../models/otp.model.js';
import { genrateOTP,getOTPhtml } from '../utils/utils.js';

/**Post request to register a new user */
export async function registerUser(req,res){
    const {username,email,password}=req.body

    if(!username || !email || !password){
        return res.status(400).json({message:'All fields are required to send a request to register a user'});
    }

    const userExists= await userModel.findOne({
$or:[
    {email:email},
    {username:username}
],
isVerified:true
})

    if(userExists){
        return res.status(409).json({message:'User already exists with this email or username '});
    }
  
    const otp=genrateOTP();
   const html=getOTPhtml(otp);

     const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

   const hashedOTP = crypto.createHash('sha256').update(otp.toString()).digest('hex');

      const newUser= await  userModel.create({
    username,
    email,
    password:hashedPassword
})

   otpModel.create({
    user:newUser._id,
    email:email,
    otpHashed:hashedOTP
   })

    await sendEmail(email,'Email Verification',`Your OTP is ${otp}`,html);
    
return res.status(201).json({message:'User registered successfully',user:newUser});
}

export async function login(req,res){
  if(!req.body.email || !req.body.password){
    return res.status(400).json({message:'Email and password are required'});   
}
const {email,password}=req.body;
const user= await userModel.findOne({email:email});
if(!user){
    return res.status(404).json({message:'User not found Please register first'});
}

if(!user.isVerified){
    return res.status(401).json({message:'User is not verified Please verify your email first'});
}

const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

if(hashedPassword !== user.password){
    return res.status(401).json({message:'Invalid password'});
}

const refreshToken = jwt.sign(
    { userId: user._id },
    config.JWT_SECRET,
    { expiresIn: '7d' }
);

const refreshTokenHashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

const session = await sessionModel.create({
    user: user._id,
    refreshToken: refreshTokenHashed,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],  
})
const accessToken = jwt.sign(
    { userId: user._id,
        sessionId: session._id
    },
    config.JWT_SECRET,
    { expiresIn: '15m' }
);

res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
return res.status(200).json({message:'User logged in successfully',user:user,token:accessToken});
}

export async function getme(req,res){
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

export async function RefreshToken(req,res){
    const refreshToken = req.cookies.refreshToken;
if(!refreshToken){
    return res.status(401).json({message:'Refresh token is missing'});
}
try{
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await sessionModel.findOne({ refreshToken: refreshTokenHashed, revoked: false });

    if(!session){
        return res.status(401).json({message:'Invalid refresh token'});
    }


    const newAccessToken = jwt.sign(
        { userId: decoded.id },
        config.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
        { userId: decoded.id },
        config.JWT_SECRET,
        { expiresIn: '7d' }
    );

    const newRefreshTokenHashed = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    session.refreshToken = newRefreshTokenHashed;
    await session.save();

    res.cookie.parse(refreshToken, newRefreshToken, {
        httpOnly: true,
        secure:true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({ message: 'Access token refreshed successfully', token: newAccessToken });
}
catch (error) {
    return res.status(401).json({message:'Invalid refresh token'});
}

}

export async function logout(req,res){
  const refreshToken =  req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({message:'Refresh token is missing'});
  }

  const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const session = await sessionModel.findOne({ refreshToken: hashedRefreshToken,revoked: false });

  if(!session){
    return res.status(401).json({message:'Invalid refresh token'});
  }
  
    session.revoked = true;
    await session.save();
    res.clearCookie('refreshToken');
    return res.status(200).json({message:'User logged out successfully'});

}

export async function logOutAll(req,res){
    const refreshToken =  req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({message:'Refresh token is missing'});
  }

   const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

   sessionModel.updateMany({ user: decoded.userId, revoked: false }, { revoked: true });
   res.clearCookie('refreshToken');
   return res.status(200).json({message:'User logged out from all devices successfully'});
}

export async function verifyEmail(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const hashedOTP = crypto
    .createHash('sha256')
    .update(String(otp))
    .digest('hex');

  const otpRecord = await otpModel.findOne({
    email,
    otpHashed: hashedOTP,
  });

  if (!otpRecord) {
    return res.status(404).json({ message: 'Invalid OTP or email' });
  }

  const user = await userModel.findById(otpRecord.user);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.isVerified = true;
  await user.save();

  await otpModel.deleteMany({ user: user._id });

  return res.status(200).json({
    message: 'Email verified successfully',
    user,
  });
}