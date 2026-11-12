import mogoose from 'mongoose';

const sessionSchema=new mogoose.Schema({
    user:{
        type:mogoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'User is required to create a session']
    },
    refreshToken:{
        type:String,
        required:[true,'Refresh token is required to create a session']
    },
    ipAddress:{
        type:String,
        required:[true,'IP address is required to create a session']
    },
    userAgent:{
        type:String,
        required:[true,'User agent is required to create a session']
    },
    revoked:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const sessionModel=mogoose.model('Session',sessionSchema);

export default sessionModel;