import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name.tirm() || !description.trim()){
        throw new ApiError(404,"All fields are requires")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200,"Playlist created successfully",playlist))
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(404,"User not found")
    }

    const playlist = await Playlist.find({
        owner: userId,
    });

    if(playlist.length()=== 0){
        throw new ApiError(404,"Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,"Playlist fetched successfully",playlist))
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
       throw new ApiError(404,"Ivalid playlist")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse (200,playlist,"Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"either playlist or video is invalid")
    }

    const addToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet : {
                videos:videoId,
            }
        },
        {new: true}
    );

    if(!addToPlaylist){
        throw new ApiError(400,"Some error occurred while adding video to playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,addToPlaylist,"Video added successfully")
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || !videoId){
        throw new ApiError(400,"either playlist or video is invalid")
    }

    const removeFromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull : {
                videos:videoId,
            }
        },
        {new: true}
    );

    if(!removeFromPlaylist){
        throw new ApiError(400,"Some error occurred while removing video from playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,removeFromPlaylist,"Video removed successfully")
        );
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(404,"Playlist not found")
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);
    if(!deletePlaylist) throw new ApiError(400,"Some error occurred while deleting playlsit")

    return res
        .status(200)
        .json(
            new ApiResponse(200,"playlist deleted successfully")
        );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId){
        throw new ApiError(404,"Playlist Not found");
    }

    if(!name.trim() || description.trim()){
        throw new ApiError(404,"All fields are required")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            },

        },
        {new:true}
    )

    if(!updatePlaylist){
        throw new ApiError(400,"Some Error occurred while updating playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,updatePlaylist,"Playlist updated successfully")
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}