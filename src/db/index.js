import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";

const connetDB = async() => {
    try{
        const connectionIst=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected! DB host: ${connectionIst.connection.host}`)
    }catch(error){
        console.log("MongoDB connection error", error)
        process.exit(1)
    }
}

export default connetDB