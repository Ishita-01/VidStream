import express from "express"
import cors from "cors"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
//import { errorHandler } from "./middlewares/error.middleware.js"


const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials:true
    })
)
//common middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
//cookies
app.use(cookieParser())

// routes
app.use("/api/v1/healthcheck",healthcheckRouter) //version 1
app.use("/api/v1/users",userRoutes)


//app.use(errorHandler)
export { app }