import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new Schema({
    username: {
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true, //for removal of extra spaces
        index: true //for faster search
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true,
    },
    fullname:{
        type: String,
        required:true,
        trim: true,
        index:true,
    },
    avatar:{
        type: String, //cloudinary url
        required:true,
    },
    coverImage:{
        type: String, //cloudinary url
    },
    watchHistory : [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password:{
        type:String,
        required:[true, "password is required"]
    },
    refreshToken:{ //long-lived key to keep the user logged in
        type:String
    }

},
{timestamps:true}  //adds createdAT and updatedAt fields automatically
)


//password encryption
userSchema.pre("save",async function (next) {

    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
//Compares the entered password with the stored hashed password.
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    //for short lived access token
     return jwt.sign({ 
        _id:this._id,
        email: this.email,
        username:this.username,
        fullname:this.fullname
    }, 
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );

}
//used to generate new accessToken, long lived
userSchema.methods.generateRefreshToken = function(){
   
     return jwt.sign({ 
        _id:this._id,
        
    }, 
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );

}
 
export const User = mongoose.model("User",userSchema)
