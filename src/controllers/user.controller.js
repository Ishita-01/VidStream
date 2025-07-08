import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";



const generateAccessTokenAndRefereshToken = async(UserId) => {
    try {
        const user = await User.findById(UserId)
        if(!user){
            throw new ApiError(404,"No user found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refersh token")

    }

}


const registerUser = asyncHandler( async (req,res) => {
    
    const{fullname,email,username,password} = req.body

    //Validation
    if(
        [fullname,username,email,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    //checking if the user already exists

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with username or email already exists. Sign in instead")
    }

    //handling images 

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    //upload on cloudinary

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverIamge = ""
    // if(coverLocalPath){
    //     coverIamge = await uploadOnCloudinary(coverLocalPath)
    // }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar",avatar)
    } catch (error) {
        console.log("Error uploading avatar",avatar)
        throw new ApiError(500,"failed to upload avatar")

    }

    let coverIamge;
    try {
        coverIamge = await uploadOnCloudinary(coverLocalPath)
        console.log("Uploaded coverIamge",coverIamge)
    } catch (error) {
        console.log("Error uploading coverIamge",error)
        throw new ApiError(500,"failed to upload coverIamge")

    }


    //construct new user
    try {
        const user = await User.create({
            fullname,
            avatar:avatar.url,
            coverIamge: coverIamge?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering the user")
        }
    
        return res
        .status(201)
        .json(new ApiResponse(201,createdUser,"User registered successfully"))
    
    } catch (error) {
        console.log("User creation failed")

        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }

        if(coverIamge){
            await deleteFromCloudinary(coverIamge.public_id)
        }

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering the user and images were deleted")
        }
    }




})

const loginUser = asyncHandler( async (req,res) => {
    //get data from body
    const {email,username,password} = req.body
    if(!email){
        throw new ApiError(400,"Email is requires")
    }

    const user = await User.findOne({
        $or:[{username}, {email}]
    })

    if(!user){
        throw new ApiError(404,"User not found")
    }

    //validate password
    const isPasswordValid =  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }

    const {accessToken,refreshToken} = await
    generateAccessTokenAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV ==="production"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(new ApiResponse(200,loggedInUser,"User logged in successfully"))

})

const logoutUser = asyncHandler (async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {new: true}
    )

    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out successfully"));

})

const refreshAccessToken = asyncHandler( async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken
     if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }

        if( incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Invalid refresh token")
        }
        const options = {
            httpOnly:true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken,refreshToken:newRefreshToken } = await generateAccessTokenAndRefereshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(
            200,
           {accessToken,
            refreshToken: newRefreshToken
           },
            "Access token refreshed successfully"
        ));



    } catch (error) {
        throw new ApiError(500,"Something went wrong while refreshing acsess token");
        
    }


})

const changeCurrentPassword = asyncHandler(async (req,res) => {
   const {oldPassword,newPassword} = req.body
   const user = await User.findById(req.user?._id)

   const isPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordValid){
    throw new ApiError(401,"Old password is incorrect")
   }

   user.password = newPassword

   await user.save({validateBeforeSave: false})

   return res.
    status(200)
    .json(new ApiResponse(
        200,{},"Password change successfully"
    ))
})

const getCurrentUser = asyncHandler(async (req,res) => {
   return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current user details")) 
})

const updateAccountDetails = asyncHandler(async (req,res) => {
   const {fullname,email} = req.body
    
   if(!fullname || !email){
    throw new ApiError(400,"Fullname and email are required")
   }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,email:email
            }
            
        },
        {new:true}
   ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated"))

})

const updateUserAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path 

    if(!avatarLocalPath){
        throw new ApiError(400,"File is required")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(500,"Something went wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

     return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req,res) => {
    const coverLocalPath = req.file?.path 

    if(!coverLocalPath){
        throw new ApiError(400,"File is required")
    }

    const coverImage =  await uploadOnCloudinary(coverLocalPath)

    if(!coverImage.url){
        throw new ApiError(500,"Something went wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

     return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = await asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
     return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export{
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}