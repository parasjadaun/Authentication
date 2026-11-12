import monoose from 'mongoose';

const otpSchema = new monoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"],
    },
    user:{
        type:monoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,"User is required"],
    },
    otpHashed:{
        type:String,
        required:[true,"OTP is required"],}
},{
    timestamps:true,
});

const otpModel=monoose.model('OTP',otpSchema);
export default otpModel;