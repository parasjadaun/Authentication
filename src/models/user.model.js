import mongoose from 'mongoose';

const userSchema =new mongoose.Schema({
    username:{
        type:String,
        required:[true,"UserName is required"],
        unique:[true,"UserName must be unique"],
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email must be unique"],
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    isVerified:{
        type:Boolean,
        default:false,
    }
},{
    timestamps:true,
});


const userModel=mongoose.model('User',userSchema);

export default userModel;