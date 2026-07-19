import mongoose from "mongoose";
import { Video } from "./src/models/video.models.js";
import { User } from "./src/models/user.models.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function publishAllVideos() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/vidtube`);
    console.log("Connected to DB vidtube");
    
    const user = await User.findOne({ username: 'ishii' });
    console.log(`Watch History IDs:`, user?.watchHistory);
    
    const videos = await Video.find({ _id: { $in: user?.watchHistory } });
    console.log(`Found Videos in DB:`, videos.length);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

publishAllVideos();
