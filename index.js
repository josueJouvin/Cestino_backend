import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js";
import sellerRoutes from "./routes/sellerRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import fileUpload from "express-fileupload";


const app = express()
app.use(express.json())
dotenv.config()
connectDB()

const allowedDomains = [process.env.FRONTEND_URL]
const corsOptions = {
    origin: function(origin, callback){
        if(allowedDomains.indexOf(origin) !== 1){
            callback(null,true)
        }else{
            callback(new Error("No permitido"))
        }
    }
}

app.use(cors(corsOptions))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads"
}))

app.use("/api/vendedor", sellerRoutes)
app.use("/api/producto", productRoutes)


const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log("funcionando 4000")
})