import dotenv from "dotenv"
import { app } from "./app.js" ; 
import connetDB from "./db/index.js";

dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 8001;

connetDB()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})  
})
.catch((err) => {
    console.log("MongoDB connection error", err);
})
