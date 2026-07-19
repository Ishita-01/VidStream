import express from "express"
import cors from "cors"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import videoRoutes from "./routes/video.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import likeRoutes from "./routes/like.routes.js"
import playlistRoutes from "./routes/playlist.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"
//import { errorHandler } from "./middlewares/error.middleware.js"


const app = express()

app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
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
app.use("/api/v1/videos",videoRoutes)
app.use("/api/v1/comments",commentRoutes)
app.use("/api/v1/likes",likeRoutes)
app.use("/api/v1/playlists",playlistRoutes)
app.use("/api/v1/subscriptions",subscriptionRoutes)


// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || []
    });
});

export { app }