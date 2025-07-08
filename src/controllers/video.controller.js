import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Like} from "../models/like.models.js"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pipeline=[]

    if(query?.trim()){
        pipeline.push({
            $search:{
                index: "search-videos",
                text:{
                    query: query.trim(),
                    path: ["title","description"]
                }
            }
        })
    }

    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(404,"Invalid user Id");
        }

        pipeline.push({
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    pipeline.push({
        $match:{
            isPublished: true
        }
    });

    if(sortBy && sortType){
        pipeline.push({
            $sort:{
                [sortBy]: sortType === "asc" ? 1:-1
            }
        });
    }else{
        pipeline.push({
            $sort:{
                createdAt:-1
            }
        });
    }

    pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              "avatar.url": 1
            }
          }
        ]
      }
    },
    {
      $unwind: "$ownerDetails"
    });

  
    const videoAggregate = Video.aggregate(pipeline);

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return res.status(200).json(
      new ApiResponse(200, videos, "Videos fetched successfully")
    );

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if([title,description].some((field)=>
       field?.trim()==="")
    ){
     throw new ApiError(400,"all fields are required")
    }

    const videoFileLocalPath=req.files?.videoFile[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError(400,"videoFile is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required")
    }

    const videoFile=await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError(400,"videoFile failed to upload")
    }
    if(!thumbnail){
        throw new ApiError(400,"thumbnail failed to upload")
    }

    const video = await Video.create({
        title,
        description,
        duration:videoFile.duration,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user?._id,
        isPublished: false
    })

    const uploadedVideo = await Video.findById(video._id)

    if(!uploadedVideo){
        throw new ApiError(500,"video upload failed")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404, "user not found...");
    }
    
    const video = await Video.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(videoId) },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "owner",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          username: "$userDetails.username",
          thumbnail: 1,
          description: 1,
          title: 1,
          views: 1,
          duration: 1,
          videoFile: 1,
        },
      },
    ]);

    if (!video || video.length === 0) {
      throw new ApiError(404, "video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video[0],"video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const {title,description} = req.body
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Video id not valid")
    }

    if(! title.trim() || !description.trim()){
        throw new ApiError(400,"all fields are required")
    }

    const video= await Video.findById(videoId)

    if(!video){
        throw new ApiError(500,"Some error occured while updating video")

    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You don't have the acess to edit this video"
        );
    }

    const thumbnailToDelete =video.thumbnail.public_id

    const thumbnailLocalPath=req.file?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400,"file does not exist")
    }

    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500,"thumbnail upload failed")
    }

    const updatedVideo =await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title,
                description:description,
                thumbnail:{
                    public_id:thumbnail.public_id,
                    url:thumbnail.url
                }
            }
        },
        { new:true}
    )

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video please try again");
    }

    if (updatedVideo) {
        await deleteFromCloudinary(thumbnailToDelete);
    }

    return res
    .status(200)
    .json(
        200,
        video,
        "video updated successfully"
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Invalid video")
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video not found")
    }
    
    if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"You dont have access to delete this video");
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new ApiError(400,"Something went wrong while deleting the video")
    }

    await deleteFromCloudinary(video.thumbnail.public_id);
    await deleteFromCloudinary(video.videoFile.public_id);
    
    await Like.deleteMany({
        video:videoId
    })

    await Comment.deleteMany({
        video: videoId,
    })
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is empty")
    }

    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(500,"couldn`t get the video")
    }
    
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }

    const toggledVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:!video?.isPublished
            }
        },{new:true}
    )

    if(!toggledVideoPublish){
        throw new ApiError(500,"failed to toggle video publish status")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: toggledVideoPublish.isPublished },
                "Video publish toggled successfully"
            )
        );

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}