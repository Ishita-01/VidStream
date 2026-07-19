import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const user = req.user?._id;
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404,"Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: user
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike?._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200,{existingLike:false})
            )
    }

    const newLike = await Like.create({
        video:videoId,
        likedBy: user
    })
    return res
            .status(200)
            .json(
                new ApiResponse(200,{newLike:true})
            )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const user = req.user?._id;
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(404,"Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: user
    });
    if(existingLike){
        await Like.findByIdAndDelete(existingLike?._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200,{existingLike:false})
            )
    }

    const newLike = await Like.create({
        comment: commentId,
        likedBy: user
    })
    return res
            .status(200)
            .json(
                new ApiResponse(200,{newLike:true})
            )

})



const getLikedVideos = asyncHandler(async (req, res) => {
    
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideo",
                
            }
        },
        {
            $unwind:"$likedVideo"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    
                },
            },
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "liked videos fetched successfully"
            )
        );
})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}