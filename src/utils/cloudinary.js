import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

console.log("In cloudinary.js - CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("In cloudinary.js - CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING");

// We will configure cloudinary inside the function to ensure env vars are loaded

    const uploadOnCloudinary = async(localFilePath) => {
        try {
            cloudinary.config({ 
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
                api_key: process.env.CLOUDINARY_API_KEY, 
                api_secret: process.env.CLOUDINARY_API_SECRET  
            });
            
            if(!localFilePath) return null
            const response = await cloudinary.uploader.upload(
                localFilePath,{
                    resource_type:"auto"
                }
            )
            console.log("File uploaded on cloudinary. File src: "+ response.url)
            //once uploaded delete from the server
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath)
            }
            return response
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath)
            }
            return null
        }
    }


    const deleteFromCloudinary = async(publicId) => {
        try {
            cloudinary.config({ 
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
                api_key: process.env.CLOUDINARY_API_KEY, 
                api_secret: process.env.CLOUDINARY_API_SECRET  
            });
            const result = await cloudinary.uploader.destroy(publicId)

        } catch (error) {
            console.log("Error deleting from cloudinary",error)
            return null
        }
    }
    export {uploadOnCloudinary,deleteFromCloudinary}