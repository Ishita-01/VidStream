import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.models.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId) throw new ApiError(400,"CommentId is required");
    if(!isValidObjectId(videoId)) throw new ApiError(400,"invalid comment id");
    
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404,"Video not found");

    

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{createdAt:-1},
        },
    
    
    ]) ;

    const paginate =  await Comment.aggregatePaginate(comments,{
        page:parseInt(page),
        limit:parseInt(limit)
    });

    return res
        .status(200)
        .json(new ApiResponse(200, paginate, "Comments fetched successfully"));


});

const addComment = asyncHandler(async (req, res) => {
    // add a comment to a video

    const {videoId} = req.params;
    const {content} = req.body;

    if(!videoId || !mongoose.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid videoId");
    }
    if(!content){
        throw new ApiError(400,"All fields are required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner:req.user.id,
    });

    if(!comment){
        throw new ApiError(400,"Failed to add comment");

    }

    return res
    .status(201)
    .json(new ApiResponse(201,"Comment created successfully",comment))
});

const updateComment = asyncHandler(async (req, res) => {
    // update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!commentId){
        throw new ApiError(404,"Id not found");
    }
    if(!content){
        throw new ApiError(404,"All fields are required");
    }

    const existingComment = await Comment.findById(commentId);
    if(!existingComment){
        throw new ApiError(404,"Comment not found");
    }

    if(existingComment.owner.toString() !== req.user.id.toString()){
        throw new ApiError(401,"You don't have permission to update this comment")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,"Comment updated successfully",comment))

    
});

const deleteComment = asyncHandler(async (req, res) => {
    // delete a comment
    const {CommentId} = req.params;

    if(!CommentId){
        throw new ApiError(404,"Comment not found")
    }

    const existingComment = await Comment.findById(commentId);
    if(!existingComment){
        throw new ApiError(404,"Comment not found");
    }

    if(existingComment.owner.toString() !== req.user.id.toString()){
        throw new ApiError(401,"Unable to delete the comment");
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId);
    if(!deleteComment){
        throw new ApiError(400,"Some error occurred");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,"Comment deleted successfully"))
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
