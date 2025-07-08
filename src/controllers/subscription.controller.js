import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(404,"Channel not found")
    }

    const isSubscribed = await Subscription.findByOne({
        subscriber:req.user.id,
        channel:channelId
    });
    if(isSubscribed){
        await Subscription.findByIdAndDelete(channelId);
        return res
            .status(200)
            .json(
                new ApiResponse(200,"Unsubscribed successfully")
            )
    }

    const newSubscription = await Subscription.create({
        subscriber: req.user?.id,
        channel:channelId
    });

    if(!newSubscription){
        throw new ApiError(400,"Some error ocuured while subscribing")
    }

    return res
        .status(200)
        .json(200,"Subscribed successfully",newSubscription)
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(404,"Channel not found");
    }

    const subscriber = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribedtosubscriber"
                        }
                    },
                    {
                        $addFields:{
                            isSubscribedBack: {
                                $in: [
                                    new mongoose.Types.ObjectId(channelId),
                                    "$subscribedToSubscriber.subscriber",
                                ],
                        },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            }
                        }
                    }
                ]

            }
        },
        {
            $unwind:"$subscriber"
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    isSubscribedBack: 1,
                    subscribersCount: 1,
                },
            },
       

        },
        
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200,subscriber,"Subscribers fetched successfully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(404,"Subscriber not found")
    }

     const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200,channels,"Subscribed channels fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}