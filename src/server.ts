import express, { json,Request,Response } from 'express'
import router from './Routes/AIRoutes'
import './controllers/telegramBot'
import cors from 'cors'
import companyRouter from './Routes/companyRoutes'
import userRouter from './Routes/userRoutes'
import uploadRouter from './Routes/blobRoutes'
const app = express()
app.use(express.urlencoded({ extended: false }));

app.use(json())
app.use(cors())

app.use('/aiChat',router)
app.use("/users", userRouter)
app.use("/companies", companyRouter)
app.use("/file", uploadRouter)

app.use("/test", (req:Request, res:Response)=>{
res.status(200).send("<h1> Hello There</h1>")
})

const port = process.env.PORT || 80 


app.listen(port,()=>{
    console.log("App Running..");
    
})

